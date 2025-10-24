const { v4: uuidv4 } = require('uuid')
const bcrypt = require('bcrypt')
const emailService = require('../services/emailService')

async function authRoutes(fastify, options) {
  // 创建游客账号
  fastify.post('/guest', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            uuid: { type: 'string' },
            nickname: { type: 'string' },
            token: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const uuid = uuidv4()
    const nickname = `游客_${uuid.slice(-4)}`

    const user = await fastify.prisma.user.create({
      data: {
        uuid,
        nickname,
        isGuest: true
      }
    })

    const token = fastify.jwt.sign({
      userId: user.id,
      uuid: user.uuid,
      isGuest: true
    })

    return {
      uuid: user.uuid,
      nickname: user.nickname,
      token
    }
  })

  // 游客升级为正式用户
  fastify.post('/register', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'nickname', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          nickname: { type: 'string', minLength: 2, maxLength: 20 },
          password: { type: 'string', minLength: 6 }
        }
      }
    },
    preHandler: fastify.authenticate
  }, async (request, reply) => {
    const { email, nickname, password } = request.body
    const { userId } = request.user

    // 检查邮箱是否已存在
    const existingUser = await fastify.prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return reply.code(400).send({ error: '该邮箱已被注册' })
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(password, 10)

    // 更新用户信息
    const user = await fastify.prisma.user.update({
      where: { id: userId },
      data: {
        email,
        nickname,
        passwordHash,
        isGuest: false
      }
    })

    // 发送验证邮件
    try {
      await emailService.sendVerificationEmail(user, fastify.prisma)
    } catch (error) {
      fastify.log.error('发送验证邮件失败:', error)
      // 不影响注册流程
    }

    return {
      success: true,
      message: '注册成功，请查收验证邮件',
      email: user.email
    }
  })

  // 登录
  fastify.post('/login', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    const { email, password } = request.body

    const user = await fastify.prisma.user.findUnique({
      where: { email }
    })

    if (!user || user.isGuest) {
      return reply.code(401).send({ error: '邮箱或密码错误' })
    }

    if (!user.passwordHash) {
      return reply.code(401).send({ error: '邮箱或密码错误' })
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return reply.code(401).send({ error: '邮箱或密码错误' })
    }

    // 更新最后登录时间
    await fastify.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    const token = fastify.jwt.sign({
      userId: user.id,
      uuid: user.uuid,
      isGuest: false
    })

    return {
      token,
      user: {
        id: user.id,
        uuid: user.uuid,
        email: user.email,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        emailVerified: user.emailVerified
      }
    }
  })

  // 验证邮箱
  fastify.get('/verify-email/:token', async (request, reply) => {
    const { token } = request.params

    const verification = await fastify.prisma.emailVerification.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!verification || verification.verified) {
      return reply.code(400).send({ error: '验证链接无效' })
    }

    if (new Date() > verification.expiresAt) {
      return reply.code(400).send({ error: '验证链接已过期' })
    }

    // 更新验证状态
    await fastify.prisma.emailVerification.update({
      where: { id: verification.id },
      data: { verified: true }
    })

    await fastify.prisma.user.update({
      where: { id: verification.userId },
      data: { emailVerified: true }
    })

    return {
      success: true,
      message: '邮箱验证成功',
      user: {
        nickname: verification.user.nickname,
        email: verification.user.email
      }
    }
  })
}

module.exports = authRoutes
