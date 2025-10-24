const nodemailer = require('nodemailer')
const crypto = require('crypto')

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })
  }

  async sendVerificationEmail(user, prisma) {
    // 生成验证token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小时后过期

    // 保存验证记录
    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token,
        expiresAt
      }
    })

    // 构建验证链接
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`

    // 发送邮件
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: '验证您的1024游戏账号',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f5f5f7; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #007aff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; color: #86868b; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎮 1024 游戏</h1>
            </div>
            <div class="content">
              <h2>验证您的邮箱</h2>
              <p>您好 <strong>${user.nickname}</strong>，</p>
              <p>欢迎加入1024游戏！请点击下方按钮验证您的邮箱：</p>
              <p style="text-align: center;">
                <a href="${verificationUrl}" class="button">验证邮箱</a>
              </p>
              <p style="color: #86868b; font-size: 14px;">
                或者复制以下链接到浏览器：<br>
                <span style="word-break: break-all;">${verificationUrl}</span>
              </p>
              <p style="color: #86868b; font-size: 14px;">
                此链接将在24小时后过期。
              </p>
              <p>如果不是您本人操作，请忽略此邮件。</p>
            </div>
            <div class="footer">
              <p>© 2024 1024游戏. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }

    try {
      await this.transporter.sendMail(mailOptions)
      return token
    } catch (error) {
      console.error('发送邮件失败:', error)
      throw error
    }
  }
}

module.exports = new EmailService()
