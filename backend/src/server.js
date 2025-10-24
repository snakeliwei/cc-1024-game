const build = require('./app')

const start = async () => {
  const app = build()

  try {
    const port = process.env.PORT || 3000
    const host = process.env.HOST || '0.0.0.0'

    await app.listen({ port, host })

    console.log(`
╔═══════════════════════════════════════╗
║                                       ║
║       🎮 1024 Game API Server        ║
║                                       ║
║  Server running at:                  ║
║  http://localhost:${port}              ║
║                                       ║
║  Environment: ${process.env.NODE_ENV || 'development'}            ║
║                                       ║
╚═══════════════════════════════════════╝
    `)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

// 优雅关闭
const signals = ['SIGINT', 'SIGTERM']
signals.forEach(signal => {
  process.on(signal, async () => {
    console.log(`\n收到 ${signal} 信号，正在优雅关闭...`)
    process.exit(0)
  })
})

start()
