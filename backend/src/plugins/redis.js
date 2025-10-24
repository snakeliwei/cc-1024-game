const fp = require('fastify-plugin')
const Redis = require('ioredis')

async function redisPlugin(fastify, options) {
  let redis

  try {
    redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      retryStrategy: (times) => {
        if (times > 3) {
          fastify.log.warn('Redis connection failed after 3 retries, running without cache')
          return null
        }
        return Math.min(times * 50, 2000)
      }
    })

    redis.on('connect', () => {
      fastify.log.info('Redis connected')
    })

    redis.on('error', (err) => {
      fastify.log.error('Redis error:', err)
    })

    // 注册到fastify实例
    fastify.decorate('redis', redis)

    // 优雅关闭
    fastify.addHook('onClose', async (instance) => {
      await instance.redis.quit()
      fastify.log.info('Redis disconnected')
    })
  } catch (error) {
    fastify.log.warn('Redis not available, running without cache:', error.message)
    // 提供一个假的redis对象，避免代码中null检查
    fastify.decorate('redis', null)
  }
}

module.exports = fp(redisPlugin)
