// Imports

// Importamos librerias requeridas
const express = require('express')
const path = require('node:path')
const session = require('express-session')
const bcryptjs = require('bcryptjs')
const dotenv = require('dotenv')
const pc = require('picocolors')

// Seteamos el archivo .env
dotenv.config({ path: './src/env/.env' })

// // Importamos nuestros servicios
const getTokenService = require('./src/services/getTokenFromML.js')
const getPublicationsService = require('./src/services/getPublicationsFromML.js')
const getPublicationDataService = require('./src/services/getPublicationDataFromML.js')
const getUserDataService = require('./src/services/getUserDataFromBD.js')
const getSellersUserService = require('./src/services/getSellersUserFromBD.js')
const getSellerDataService = require('./src/services/getSellerDataFromML.js')

// // Importamos nuestro controlador de BD
const dbController = require('./src/controllers/dbConnector.js')
const { checkSellersDataForHome } = require('./src/services/checkSellersDataForHome.js')

// Constantes
const PORT = 3000 // Puerto de app
const app = express() // Aplicación básica de express

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

// Peticion a /
app.get('/', (req, res) => {
  // Si no hay sesión iniciada, se redirecciona al login
  if (!req.session.user || req.session.user === 0) {
    res.render('login.ejs')
  } else {
    res.redirect('/home')
  }
})

app.get('/home', async (req, res) => {
  if (!req.session.user || req.session.user === 0) {
    res.redirect('/')
    return
  }

  // Obtenemos perfiles del usuario que inició sesión
  const profiles = await getSellersUserService.getSellers(req.session.user)

  const processedProfiles = await checkSellersDataForHome(profiles, req.session.user)

  console.log(pc.bgGreen('Profiles procesados: '), processedProfiles)

  const profilesNicknames = profiles.map((profile) => {
    return {
      seller_id: profile.seller_id,
      nickname: processedProfiles[profile.seller_id].nickname,
      state: processedProfiles[profile.seller_id].state
    }
  })

  req.session.sellers = [...profilesNicknames]

  console.log(pc.bgBlue('Profiles obtenidos: '), profilesNicknames)

  res.render('dashboard.ejs', {
    sellers: profilesNicknames,
    message: '',
    username: req.session.username
  })
})

// Peticion a /auth para vinculacion
app.get('/auth', async (req, res) => {
  if (!req.session.user || req.session.user === 0) {
    res.redirect('/')
    return
  }

  const code = req.query.code // Obtenemos el parametro code de la URL luego de que ML realice la autenticacion y nos redirija aquí
  const client_secret = getTokenService.getClientSecret() // Retorna la variable preexistente client_secret
  const requestOptions = getTokenService.setRequest(code, client_secret) // Armamos las options de la request de datos del usuario

  try { // Ejecutamos el request para obtener la data del seller,
    // para poder estructurar el código bien sin frenar los procesos
    const resultLink = await getTokenService.doAsyncRequest(requestOptions, getTokenService.asyncCallback, req.session.user)

    console.log('Resultado de vinculación: ')
    console.log(resultLink)

    if (resultLink.existentUser) {
      res.render('dashboard.ejs', {
        sellers: req.session.sellers,
        message: 'Usuario vinculado en otra cuenta!'
      })
      return
    }

    if (resultLink.seller_id) {
      const requestOptionsSellerData = getSellerDataService.setRequest(resultLink.access_token, resultLink.seller_id)
      const resultGetDataSeller = await getSellerDataService.doRequest(requestOptionsSellerData, getSellerDataService.asyncCallback)
      console.log(resultGetDataSeller)
      res.redirect('/home')
    }
  } catch (err) {
    // Renderizamos el index.ejs con state "Error vinculando" en caso de error
    console.log(err)
    res.render('dashboard.ejs', {
      sellers: req.session.sellers,
      message: 'Error vinculando'
    })
  }
})

app.get('/seller', (req, res) => {
  if (!req.session.user || req.session.user === 0) {
    res.redirect('/')
    return
  }

  req.session.seller_id = req.query.seller_id
  req.session.nickname = req.query.nickname
  console.log('Session seller:', req.session.seller_id)
  console.log('Session nickname:', req.session.nickname)

  res.render('index.ejs', { state: req.session.nickname })
})

app.post('/login', async (req, res) => {
  // Tomamos user y pass de la peticion post para login
  const username = req.body.username
  const password = req.body.password

  console.log('Username:', username)
  console.log('Password:', password)

  if (username && password) {
    const results = await getUserDataService.getUsers(username) // Solicitamos todas las contraseñas de la base de datos cuyo nombre de usuario coincida con el enviado por la función para poder comparar.

    if (results.length === 0 || !(await bcryptjs.compare(password, results[0].password))) { // si no hay nada en base de datos o si los datos de la base de datos no coinciden
      console.log('Usuario y/o contraseña incorrecta')
      res.send('Usuario y/o contraseña incorrecta')
    } else {
      console.log('Inicio de sesión correcto')
      req.session.user = results[0].id
      req.session.username = username
      console.log('Nuevo usuario en la sesión:', req.session.user)
      res.redirect('/home')
    }
  } else { // si no hay nombre de usuario o contraseña
    console.log('Error de ingreso de datos en login.')
    res.send('Por favor, ingrese un nombre de usuario y contraseña válidos.')
  }
})

app.get('/sync', async (req, res) => {
  if (!req.session.user) {
    res.json({
      result: 'Tenés que iniciar sesión primero' // Respuesta que se envía al js del index
    })
    return
  }

  const userData = await getUserDataService.getSellerToken(req.session.seller_id, req.session.user)

  let access_token = userData[0].token
  let refresh_token = userData[0].refresh_token
  let seller_id = userData[0].seller_id

  console.log('AT: ', access_token)
  console.log('RT: ', refresh_token)
  console.log('UD: ', seller_id)

  /*
        Si no existe ninguna credencial => linea 272
        Si existe SOLO access_token, se debe probar si sigue valido y tratar de obtener un refresh_token
        Si existe SOLO un refresh_token, se debe saltar a lo de adentro del if línea 306
    */

  if (!access_token && !refresh_token) {
    console.log('No se obtuvo ninguna credencial para sincronizar.')
    res.json({
      result: 'Sin credenciales para sincronizar' // Revisar
    })
    return
  }

  let publications = [] // Array que contendrá los id de publicaciones

  let scroll_id = '' // Variable que almacenará el scroll_id una vez obtenido
  let requestCounter = 0
  const commonStatusCodeErrors = [403, 400, 401]

  while (true) {
    if (requestCounter >= 5) {
      break
    }

    try {
      console.log('Entro al while')
      // Seteamos las opciones de la consulta de publicaciones con el token e id del usuario
      // Aclaramos que en la primera iteración del bucle el scroll_id será un string vacio ""
      const requestOptionsPublications = getPublicationsService.setRequestPublications(access_token, seller_id, scroll_id)
      // Realizamos la consulta y obtener un objeto con el scroll_id y los id de publicaciones obtenidas
      const responseRequestPublications = await getPublicationsService.doAsyncRequest(requestOptionsPublications, getPublicationsService.asyncCallback)

      if (commonStatusCodeErrors.includes(responseRequestPublications.statusCode)) {
        console.log(`Se obtuvo un status code de ${responseRequestPublications.statusCode} en obtener publications`)
        if (responseRequestPublications.statusCode === 400) {
          requestCounter++
        }
        const requestOptionsRefresh = getTokenService.setRequestRefresh(getTokenService.getClientSecret(), refresh_token)

        try {
          const responseRefreshToken = await getTokenService.doAsyncRequestRefresh(requestOptionsRefresh, getTokenService.asyncCallbackRefresh, req.session.user)

          if (responseRefreshToken.access_token) {
            access_token = responseRefreshToken.access_token
            refresh_token = responseRefreshToken.refresh_token
            seller_id = responseRefreshToken.user_id

            console.log(`AT: ${access_token} RT: ${refresh_token} UD: ${seller_id}`)
            continue
          } else {
            throw new Error('No se obtuvo ningun access token en el refresh')
          }
        } catch (err) {
          console.log(pc.red('Error al obtener access token en el refresh: ', err))
        }
      }

      scroll_id = responseRequestPublications.scroll_id // Seteamos el scroll_id

      if (scroll_id == null || scroll_id == undefined) break // Cuando no hay más paginación salimos del bucle

      // Concatenamos los ids obtenidos con los existentes
      publications = publications.concat(responseRequestPublications.publications_id)
    } catch (error) {
      console.log(pc.red('Error inesperado al obtener publicaciones:', error))
      console.log(error)
    }
  }

  if (publications.length) { // Si tenemos ids, realizamos las consultas para obtener la informacion y guardarla en la BD
    publications.forEach(async (id) => {
      const requestOptionsPublicationData = getPublicationDataService.setRequestDataPublications(access_token, id)
      const statusCode = await getPublicationDataService.doAsyncRequest(requestOptionsPublicationData, getPublicationDataService.asyncCallback, req.session.user)

      console.log(statusCode)
    })

    const publicationsQuantity = `La cantidad de publicaciones obtenidas es: ${publications.length}`

    res.json({
      result: publicationsQuantity // Respuesta que se envía al js del index
    })
  } else if (!publications.length && requestCounter >= 5) {
    res.json({
      result: 'Petición invalida al obtener publicaciones' // Respuesta que se envía al js del index
    })
  } else {
    res.json({
      result: 'No se obtuvo ninguna publicación' // Respuesta que se envía al js del index
    })
  }
})

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log('Error al cerrar sesión')
    } else {
      res.redirect('/')
    }
  })
})
