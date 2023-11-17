// Imports
const request = require('request')
const dbConnector = require('../../controllers/dbConnector.js')

// Variables
const client_secret = 'sKAwWnBSHRH4Plg2UmAvPnPYHg9NL9fZ'

// Getter de la variable client_secret
function getClientSecret () {
  return client_secret
}

// Funcion para setear las options de la request
function setRequest (code, client_secret) {
  const APP_ID = process.env.APP_ID
  const REDIRECT = 'http://localhost:3000/auth'
  const HEADERS = {
    accept: 'application/json',
    'content-type': 'application/x-www-form-urlencoded'
  }

  const dataString = `grant_type=authorization_code&client_id=${APP_ID}&client_secret=${client_secret}&code=${code}&redirect_uri=${REDIRECT}`

  const options = {
    url: 'https://api.mercadolibre.com/oauth/token',
    method: 'POST',
    headers: HEADERS,
    body: dataString
  }

  return options
}

// Callback asíncrono
async function asyncCallback (error, response, body, user) {
  if (error) throw error
  console.log('Resultado de obtener token: ' + response.statusCode) // Línea para debug
  const responseJSON = JSON.parse(body) // Pasamos el JSON a un objeto

  if (responseJSON.access_token) {
    // Ya tenemos los access_token, refresh_token y user_id, los almacenamos en variables
    const { access_token, refresh_token, user_id } = responseJSON

    console.log('Almacenamos token') // Línea para debug

    const resultLink = await dbConnector.saveUserData(access_token, refresh_token, user_id, user) // Guardamos los datos del usuario en la db

    return resultLink
  } else {
    throw new Error('Sin access token')
  }
}

// Funcion para llamar al request
function doAsyncRequest (requestOptions, asyncRequestCallback, user) {
  return new Promise((resolve, reject) => {
    request(requestOptions, (error, response, body) => {
      asyncRequestCallback(error, response, body, user)
        .then((value) => resolve(value))
        .catch((error) => reject(error))
    })
  })
}

// Funcion para setear las options de la request para refresh
function setRequestRefresh (client_secret, refresh_token) {
  const APP_ID = '4080755184952911'

  const HEADERS = {
    accept: 'application/json',
    'content-type': 'application/x-www-form-urlencoded'
  }

  const dataStringRefresh = `grant_type=refresh_token&client_id=${APP_ID}&client_secret=${client_secret}&refresh_token=${refresh_token}`

  const options = {
    url: 'https://api.mercadolibre.com/oauth/token',
    method: 'POST',
    headers: HEADERS,
    body: dataStringRefresh
  }

  return options
}

// Callback asíncrono para refresh
async function asyncCallbackRefresh (error, response, body, id) {
  if (error) throw error

  console.log('Resultado de obtener token desde refresh: ' + response.statusCode) // Línea para debug
  const responseJSONRefresh = JSON.parse(body) // Pasamos el JSON a un objeto

  if (responseJSONRefresh.access_token) {
    // Ya tenemos los access_token, refresh_token y seller_id, los almacenamos en variables
    // let seller_id = responseJSONRefresh.user_id;
    const { access_token, refresh_token, user_id: seller_id } = responseJSONRefresh

    console.log('Almacenamos token') // Línea para debug

    // Si tiene, almacenamos el nuevo access y refresh

    await dbConnector.updateUserData(access_token, refresh_token, seller_id, id)

    return responseJSONRefresh
  } else {
    return {
      statusCode: response.statusCode
    }
  }
}

// Funcion para ejecutar el callback asíncrono del refresh
function doAsyncRequestRefresh (requestOptions, asyncRequestCallback, id) {
  return new Promise((resolve, reject) => {
    request(requestOptions, (error, response, body) => {
      asyncRequestCallback(error, response, body, id)
        .then((value) => resolve(value))
        .catch((error) => reject(error))
    })
  })
}

// Export de las funciones del archivo getToken.js
module.exports = {
  getClientSecret,
  setRequest,
  doAsyncRequest,
  asyncCallback,
  setRequestRefresh,
  doAsyncRequestRefresh,
  asyncCallbackRefresh
}
