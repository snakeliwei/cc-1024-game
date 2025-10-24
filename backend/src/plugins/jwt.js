const fp = require('fastify-plugin')
const jwt = require('@fastify/jwt')

async function jwtPlugin(fastify, options) {
  fastify.register(jwt, {
    secret: process.env.JWT_SECRET || 'fallback-secret-key-change-this'
  })

  // 装饰器：验证JWT
  fastify.decorate('authenticate', async function (request, reply) {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.code(401).send({ error: '未授权访问' })
    }
  })

  // 装饰器：可选的JWT验证（游客和登录用户都可访问）
  fastify.decorate('optionalAuth', async function (request, reply) {
    try {
      await request.jwtVerify()
    } catch (err) {
      // 不抛出错误，允许继续
      request.user = null
    }
  })
}

module.exports = fp(jwtPlugin)
