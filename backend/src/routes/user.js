async function userRoutes(fastify, options) {
  // 获取用户信息
  fastify.get('/profile', {
    preHandler: fastify.authenticate
  }, async (request, reply) => {
    const { userId } = request.user

    const user = await fastify.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        uuid: true,
        email: true,
        nickname: true,
        isGuest: true,
        avatarUrl: true,
        emailVerified: true,
        createdAt: true
      }
    })

    if (!user) {
      return reply.code(404).send({ error: '用户不存在' })
    }

    // 获取用户统计
    const stats = await getUserStats(fastify.prisma, userId)

    return {
      user,
      stats
    }
  })

  // 更新用户信息
  fastify.put('/profile', {
    schema: {
      body: {
        type: 'object',
        properties: {
          nickname: { type: 'string', minLength: 2, maxLength: 20 },
          avatarUrl: { type: 'string' }
        }
      }
    },
    preHandler: fastify.authenticate
  }, async (request, reply) => {
    const { userId } = request.user
    const { nickname, avatarUrl } = request.body

    const updateData = {}
    if (nickname) updateData.nickname = nickname
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl

    const user = await fastify.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        uuid: true,
        email: true,
        nickname: true,
        avatarUrl: true
      }
    })

    return { user }
  })

  // 获取用户统计
  fastify.get('/stats', {
    preHandler: fastify.authenticate
  }, async (request, reply) => {
    const { userId } = request.user
    const stats = await getUserStats(fastify.prisma, userId)
    return stats
  })
}

// 辅助函数：获取用户统计数据
async function getUserStats(prisma, userId) {
  const scores = await prisma.score.findMany({
    where: { userId },
    orderBy: { score: 'desc' }
  })

  if (scores.length === 0) {
    return {
      totalGames: 0,
      bestScore: 0,
      avgScore: 0,
      totalPlayTime: 0,
      maxTile: 0
    }
  }

  const totalGames = scores.length
  const bestScore = scores[0].score
  const avgScore = Math.round(scores.reduce((sum, s) => sum + s.score, 0) / totalGames)
  const totalPlayTime = scores.reduce((sum, s) => sum + s.playTime, 0)
  const maxTile = Math.max(...scores.map(s => s.maxTile))

  return {
    totalGames,
    bestScore,
    avgScore,
    totalPlayTime,
    maxTile
  }
}

module.exports = userRoutes
