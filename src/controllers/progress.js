const pc = require('picocolors')

async function handleProgress (req, res, eventEmitter) {
  // Maneja el evento de progreso
  const onProgress = async ({ progressPublications, progressOrders }) => {
    //await res.write(`data: ${JSON.stringify({ progress })}\n\n`)
    const body = {
      status: 'progress',
      data: {
        progressPublications,
        progressOrders
      }
    };

    res.write(`data: ${JSON.stringify(body)}\n\n`);

    if (body.progressPublications >= 100 && body.progressOrders >= 100) {
      res.end()
    }
  }
  // Establece el encabezado necesario para eventos Server-Sent
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  // Escucha el evento de progreso
  await eventEmitter.on('progress', onProgress)

  // Maneja la desconexión del cliente
  req.on('close', () => {
    console.log(pc.bgRed(pc.bold('Cierro evento de progreso')))
    eventEmitter.off('progress', onProgress)
  })
}

module.exports = {
  handleProgress
}
