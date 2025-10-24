async function scoresRoutes(fastify, options) {
  // 提交分数
  fastify.post('/', {
    schema: {
      body: {
        type: 'object',
        required: ['score', 'maxTile', 'moves', 'playTime'],
        properties: {
          score: { type: 'number', minimum: 0 },
          maxTile: { type: 'number', minimum: 2 },
          moves: { type: 'number', minimum: 0 },
          playTime: { type: 'number', minimum: 0 },
          gameState: { type: 'object' }
        }
      }
    },
    preHandler: fastify.authenticate
  }, async (request, reply) => {
    const { userId } = request.user
    const { score, maxTile, moves, playTime, gameState } = request.body

    // 基本验证
    if (!isValidGameState(gameState)) {
      return reply.code(400).send({ error: '游戏状态无效' })
    }

    // 保存分数
    const scoreRecord = await fastify.prisma.score.create({
      data: {
        userId,
        score,
        maxTile,
        moves,
        playTime,
        gameState: JSON.stringify(gameState)
      }
    })

    // 查询当前排名
    const rank = await fastify.prisma.score.count({
      where: {
        score: {
          gt: score
        }
      }
    }) + 1

    // 检查是否是新记录
    const userBestScore = await fastify.prisma.score.findFirst({
      where: {
        userId,
        id: { not: scoreRecord.id }
      },
      orderBy: { score: 'desc' }
    })

    const isNewRecord = !userBestScore || score > userBestScore.score

    // 清除Redis缓存（如果存在）
    if (fastify.redis) {
      await fastify.redis.del('leaderboard:all', 'leaderboard:today', 'leaderboard:week')
    }

    return {
      rank,
      isNewRecord,
      scoreId: scoreRecord.id
    }
  })

  // 获取个人分数历史
  fastify.get('/me', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1, minimum: 1 },
          limit: { type: 'number', default: 10, minimum: 1, maximum: 100 }
        }
      }
    },
    preHandler: fastify.authenticate
  }, async (request, reply) => {
    const { userId } = request.user
    const { page = 1, limit = 10 } = request.query

    const skip = (page - 1) * limit

    const [scores, total] = await Promise.all([
      fastify.prisma.score.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      fastify.prisma.score.count({ where: { userId } })
    ])

    return {
      scores,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  })
}

// 验证游戏状态
function isValidGameState(gameState) {
  if (!gameState || !gameState.board) {
    return false
  }

  const { board } = gameState

  // 验证棋盘是4x4
  if (!Array.isArray(board) || board.length !== 4) {
    return false
  }

  for (const row of board) {
    if (!Array.isArray(row) || row.length !== 4) {
      return false
    }

    // 验证所有数字都是2的幂或0
    for (const cell of row) {
      if (cell !== 0 && (cell < 2 || (cell & (cell - 1)) !== 0)) {
        return false
      }
    }
  }

  return true
}

module.exports = scoresRoutes
