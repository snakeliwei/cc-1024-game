const fp = require('fastify-plugin')
const { PrismaClient } = require('@prisma/client')

async function prismaPlugin(fastify, options) {
  const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

  // 测试连接
  try {
    await prisma.$connect()
    fastify.log.info('Prisma connected to database')
  } catch (error) {
    fastify.log.error('Failed to connect to database:', error)
    throw error
  }

  // 注册到fastify实例
  fastify.decorate('prisma', prisma)

  // 优雅关闭
  fastify.addHook('onClose', async (instance) => {
    await instance.prisma.$disconnect()
    fastify.log.info('Prisma disconnected')
  })
}

module.exports = fp(prismaPlugin)
