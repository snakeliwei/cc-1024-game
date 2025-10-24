require('dotenv').config()
const fastify = require('fastify')

function build(opts = {}) {
  const app = fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport: process.env.NODE_ENV === 'development' ? {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname'
        }
      } : undefined
    },
    ...opts
  })

  // 注册安全插件
  app.register(require('@fastify/helmet'), {
    contentSecurityPolicy: false // 开发时关闭，生产环境需配置
  })

  // 注册CORS
  app.register(require('@fastify/cors'), {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  })

  // 注册限流
  app.register(require('@fastify/rate-limit'), {
    max: 100,
    timeWindow: '1 minute'
  })

  // 注册自定义插件
  app.register(require('./plugins/prisma'))
  app.register(require('./plugins/jwt'))
  app.register(require('./plugins/redis'))

  // 注册路由
  app.register(require('./routes/auth'), { prefix: '/api/auth' })
  app.register(require('./routes/user'), { prefix: '/api/user' })
  app.register(require('./routes/scores'), { prefix: '/api/scores' })
  app.register(require('./routes/leaderboard'), { prefix: '/api/leaderboard' })

  // 健康检查
  app.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: Date.now(),
      uptime: process.uptime()
    }
  })

  // 根路由
  app.get('/', async () => {
    return {
      name: '1024 Game API',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        auth: '/api/auth/*',
        user: '/api/user/*',
        scores: '/api/scores/*',
        leaderboard: '/api/leaderboard'
      }
    }
  })

  // 404处理
  app.setNotFoundHandler((request, reply) => {
    reply.code(404).send({
      error: 'Not Found',
      message: `Route ${request.method}:${request.url} not found`,
      statusCode: 404
    })
  })

  // 全局错误处理
  app.setErrorHandler((error, request, reply) => {
    app.log.error(error)

    // Fastify错误
    if (error.validation) {
      return reply.code(400).send({
        error: 'Validation Error',
        message: error.message,
        details: error.validation
      })
    }

    // Prisma错误
    if (error.code && error.code.startsWith('P')) {
      return reply.code(500).send({
        error: 'Database Error',
        message: '数据库操作失败'
      })
    }

    const statusCode = error.statusCode || 500
    reply.code(statusCode).send({
      error: error.name || 'Internal Server Error',
      message: error.message || '服务器内部错误',
      statusCode
    })
  })

  return app
}

module.exports = build
