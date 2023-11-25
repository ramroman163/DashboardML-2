// Imports

// Importamos librerias requeridas
const express = require('express')
const path = require('node:path')
const session = require('express-session')
const dotenv = require('dotenv')
const pc = require('picocolors')
// linea fuera de uso
// const http = require('node:http')
const { EventEmitter } = require('node:events')

// Seteamos el archivo .env
dotenv.config({ path: './src/env/.env' })

// // Importamos nuestros servicios
const getTokenService = require('./src/services/seller/getTokenFromML.js')
const getPublicationDataService = require('./src/services/publication/getPublicationDataFromML.js')
const getSellerDataService = require('./src/services/seller/getSellerDataFromML.js')
// Importamos nuestro controlador de BD
const dbController = require('./src/controllers/dbConnector.js')
const { processPublications } = require('./src/services/publication/processPublications.js')
const { processOrders } = require('./src/services/order/processOrders.js')
const { processShippings } = require('./src/services/shipping/processShippings.js')

const sellersController = require('./src/controllers/sellers.js')
const userController = require('./src/controllers/users.js')
const progressController = require('./src/controllers/progress.js')

// Constantes
const PORT = 3000 // Puerto de app
const app = express() // Aplicación básica de express
// linea innecesaria, pero que estaba y no se usaba
// const server = http.createServer(app)

// Especificamos el manejo de JSON
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Sesion
app.use(session({
  // Mas adelante utilizamos una propiedad token
  secret: 'mi_secreto',
  resave: true,
  saveUninitialized: true
}))

// Seteamos motor de vistas y rutas
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'src/views'))
app.use(express.static(path.join(__dirname, 'src/views-js')))
app.use(express.static(path.join(__dirname, 'src/views-css')))
app.use(express.static(path.join(__dirname, 'src/views')))
// El uso de path nos permite que esto corra tanto en windows como linux, debe contener un "__dirname"

// Iniciamos servidor
app.listen(PORT, () => {
  // Iniciamos conexion con la BD
  try {
    dbController.connectDb()
    console.log(pc.green(`\nServidor escuchando en http://localhost:${PORT}`))
  } catch (err) {
    console.error(pc.red('Error al iniciar app'))
    process.exit(1)
  }
})

app.use((req, res, next) => {
  if (!req.session.user || req.session.user === 0) {
    if (req.url !== '/login') {
      res.redirect('/login')
    } else {
      next()
    }
  } else if (req.url === '/login') {
    res.redirect('home')
  } else {
    next()
  }
})

// Peticion a /
app.get('/', (req, res) => {
  res.redirect('/home')
})

app.get('/login', (req, res) => {
  res.render('login.ejs')
})

const eventEmitter = new EventEmitter()

app.get('/home', async (req, res) => await sellersController.getSellersByUser(req, res))
app.get('/seller', async (req, res) => await sellersController.getSeller(req, res))
app.get('/logout', async (req, res) => await userController.logout(req, res))
app.post('/login', async (req, res) => await userController.login(req, res))
app.get('/progress', async (req, res) => await progressController.handleProgress(req, res, eventEmitter))

// Peticion a /auth para vinculacion
app.get('/auth', async (req, res) => {
  const code = req.query.code // Obtenemos el parametro code de la URL luego de que ML realice la autenticacion y nos redirija aquí
  const clientSecret = getTokenService.getClientSecret() // Retorna la variable preexistente client_secret
  const requestOptions = getTokenService.setRequest(code, clientSecret) // Armamos las options de la request de datos del usuario

  try { // Ejecutamos el request para obtener la data del seller,
    // para poder estructurar el código bien sin frenar los procesos
    const resultLink = await getTokenService.doAsyncRequest(requestOptions, getTokenService.asyncCallback, req.session.user)

    console.log('Resultado de vinculación: ')
    console.log(resultLink)

    if (resultLink.existentUser) {
      res.render('dashboard.ejs', {
        sellers: req.session.sellers,
        message: 'Usuario vinculado en otra cuenta!',
        username: req.session.username
      })
      return
    }

    if (resultLink.seller_id) {
      const requestOptionsSellerData = getSellerDataService.setRequest(resultLink.access_token, resultLink.seller_id)
      const { message } = await getSellerDataService.doRequest(requestOptionsSellerData, getSellerDataService.asyncCallback)
      console.log(message)
      res.render('dashboard.ejs', {
        sellers: req.session.sellers,
        message,
        username: req.session.username
      })
    }
  } catch (err) {
    // Renderizamos el index.ejs con state "Error vinculando" en caso de error
    console.log(err)
    res.render('dashboard.ejs', {
      sellers: req.session.sellers,
      message: 'Error vinculando',
      username: req.session.username
    })
  }
})

app.get('/publications', async (req, res) => await sellersController.getPublications(req, res))

app.get('/sync', async (req, res) => {
  console.log('Datos en session: ', pc.blue(req.session.seller_id, req.session.user))

  const progressStatus = {
    progressPublications: 0,
    progressOrders: 0
  }

  progressStatus.progressPublications = 0
  eventEmitter.emit('progress', progressStatus)
  console.log(pc.bgMagenta(progressStatus.progressPublications))
  // Proceso publicaciones
  const { publications, requestCounter, accessToken } = await processPublications(req.session.seller_id, req.session.user)

  // Proceso ordenes
  const { message: messageOrders } = await processOrders(req.session.seller_id, req.session.user, eventEmitter, progressStatus)

  // Proceso shippings
  const { message: messageShippings, shippings: shippingsNumber } = await processShippings(req.session.seller_id, req.session.user)

  if (publications.length) { // Si tenemos ids, realizamos las consultas para obtener la informacion y guardarla en la BD
    progressStatus.progressPublications += 50
    eventEmitter.emit('progress', progressStatus)
    console.log(pc.bgMagenta(progressStatus.progressPublications))

    for (const id of publications) {
      const requestOptionsPublicationData = getPublicationDataService.setRequestDataPublications(accessToken, id)
      const statusCode = await getPublicationDataService.doAsyncRequest(requestOptionsPublicationData, getPublicationDataService.asyncCallback, req.session.user)

      if (statusCode === 200) {
        progressStatus.progressPublications += Math.round(50 / publications.length)

        // Redondea al entero más cercano antes de emitir el evento
        //const roundedPercent = Math.round(progressStatus.progressPublications)

        await new Promise((resolve) => {
          setTimeout(() => {
            eventEmitter.emit('progress', progressStatus)
            console.log(pc.bgMagenta(progressStatus))
            resolve()
          }, 100)
        })
      }
    }

    // eventEmitter.emit('progress', percentPublicationsProcessed)

    const syncResult = `La cantidad de publicaciones obtenidas es: ${publications.length}. ${messageOrders}. ${messageShippings}: ${shippingsNumber}`
    console.log(pc.bgRed(pc.bold('Respondo petición de sync')))
    res.json({
      result: syncResult // Respuesta que se envía al js del index
    })
  } else if (!publications.length && requestCounter >= 5) {
    const syncResult = `Petición invalida al obtener publicaciones. ${messageOrders}. ${messageShippings}: ${shippingsNumber}`

    res.json({
      result: syncResult // Respuesta que se envía al js del index
    })
  } else {
    percentPublicationsProcessed = 100
    eventEmitter.emit('progress', percentPublicationsProcessed)

    const syncResult = `No se obtuvo ninguna publicación. ${messageOrders}. ${messageShippings}: ${shippingsNumber}`
    res.json({
      result: syncResult // Respuesta que se envía al js del index
    })
  }
})
