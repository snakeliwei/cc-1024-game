async function leaderboardRoutes(fastify, options) {
  // 获取排行榜
  fastify.get('/', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          period: { type: 'string', enum: ['today', 'week', 'month', 'all'], default: 'all' },
          limit: { type: 'number', default: 100, minimum: 1, maximum: 1000 }
        }
      }
    },
    preHandler: fastify.optionalAuth
  }, async (request, reply) => {
    const { period = 'all', limit = 100 } = request.query

    // 检查Redis缓存
    const cacheKey = `leaderboard:${period}`
    if (fastify.redis) {
      const cached = await fastify.redis.get(cacheKey)
      if (cached) {
        const data = JSON.parse(cached)

        // 如果用户已登录，添加个人排名
        if (request.user) {
          const myRank = await getMyRank(fastify.prisma, request.user.userId, period)
          data.myRank = myRank
        }

        return data
      }
    }

    // 获取时间范围
    const dateFilter = getDateFilter(period)

    // 查询排行榜
    const scores = await fastify.prisma.score.findMany({
      where: dateFilter,
      orderBy: { score: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatarUrl: true,
            isGuest: true
          }
        }
      }
    })

    // 格式化数据
    const rankings = scores.map((score, index) => ({
      rank: index + 1,
      id: score.id,
      nickname: score.user.nickname,
      avatarUrl: score.user.avatarUrl,
      isGuest: score.user.isGuest,
      score: score.score,
      maxTile: score.maxTile,
      moves: score.moves,
      playTime: score.playTime,
      createdAt: score.createdAt
    }))

    const result = { rankings }

    // 缓存到Redis（5分钟）
    if (fastify.redis) {
      await fastify.redis.setex(cacheKey, 300, JSON.stringify(result))
    }

    // 如果用户已登录，添加个人排名
    if (request.user) {
      const myRank = await getMyRank(fastify.prisma, request.user.userId, period)
      result.myRank = myRank
    }

    return result
  })

  // 查询某个分数的排名
  fastify.get('/rank/:score', async (request, reply) => {
    const { score } = request.params

    const rank = await fastify.prisma.score.count({
      where: {
        score: {
          gt: parseInt(score)
        }
      }
    }) + 1

    const total = await fastify.prisma.score.count()

    return {
      rank,
      total,
      percentile: total > 0 ? Math.round((1 - rank / total) * 100) : 0
    }
  })
}

// 获取时间过滤条件
function getDateFilter(period) {
  const now = new Date()
  let startDate

  switch (period) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      break
    case 'week':
      const dayOfWeek = now.getDay()
      startDate = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000)
      startDate.setHours(0, 0, 0, 0)
      break
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    default:
      return {}
  }

  return {
    createdAt: {
      gte: startDate
    }
  }
}

// 获取用户个人最佳排名
async function getMyRank(prisma, userId, period) {
  const dateFilter = getDateFilter(period)

  const myBestScore = await prisma.score.findFirst({
    where: {
      userId,
      ...dateFilter
    },
    orderBy: { score: 'desc' }
  })

  if (!myBestScore) {
    return null
  }

  const rank = await prisma.score.count({
    where: {
      score: {
        gt: myBestScore.score
      },
      ...dateFilter
    }
  }) + 1

  return {
    rank,
    score: myBestScore.score,
    maxTile: myBestScore.maxTile
  }
}

module.exports = leaderboardRoutes
