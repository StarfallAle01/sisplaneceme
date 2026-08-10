export function requestLogger(req, res, next) {
  const start = Date.now()
  const { method, originalUrl } = req
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'desconocido'

  res.on('finish', () => {
    const duration = Date.now() - start
    const status = res.statusCode
    const emoji = status < 400 ? 'OK' : status < 500 ? 'WARN' : 'ERR'
    console.log(`[${emoji}] ${method} ${originalUrl} -> ${status} (${duration}ms) [${ip}]`)
  })

  next()
}
