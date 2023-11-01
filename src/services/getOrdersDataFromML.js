// Imports
const request = require('request')
const dbConnector = require('../controllers/dbConnector.js')

// Funcion para setear las options de la request
function setRequestDataPublications (accessToken, orderId) {
  const headers = {
    Authorization: `Bearer: ${accessToken}`
  }

  const options = {
    url: `https://api.mercadolibre.com/mal${orderId}`,
    headers
  }

  return options
}

// Callback asíncrono, donde parseamos el JSON y almacenamos la data de la publicacion
async function asyncCallback (error, response, body, user) {
  if (error) throw error

  const responsePublicationDataJSON = JSON.parse(body) // Pasamos el JSON a un objeto

  if (response.statusCode === 200) {
    return response.statusCode
  } else {
    throw new Error('No se pudo obtener la información')
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

module.exports = {
  setRequestDataPublications,
  asyncCallback,
  doAsyncRequest
}
