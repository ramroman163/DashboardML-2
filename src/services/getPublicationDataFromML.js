// Imports
const request = require('request')
const dbConnector = require('../controllers/dbConnector.js')

// Funcion para setear las options de la request
function setRequestDataPublications (access_token, publication_id) {
  const headers = {
    Authorization: `Bearer: ${access_token}`
  }

  const options = {
    url: `https://api.mercadolibre.com/items?ids=${publication_id}`,
    headers
  }

  return options
}

// Callback asíncrono, donde parseamos el JSON y almacenamos la data de la publicacion
async function asyncCallback (error, response, body, user) {
  if (error) throw error

  const responsePublicationDataJSON = JSON.parse(body) // Pasamos el JSON a un objeto

  if (response.statusCode === 200) {
    // console.log(responsePublicationDataJSON[0].body) Línea para debug
    // Pasamos los atributos a variables para una mejor comprensión y evitar errores
    const seller_id = responsePublicationDataJSON[0].body.seller_id
    const item_id = responsePublicationDataJSON[0].body.id
    const title = responsePublicationDataJSON[0].body.title
    const status = responsePublicationDataJSON[0].body.status
    const sub_status = responsePublicationDataJSON[0].body.sub_status
    const price = responsePublicationDataJSON[0].body.price
    const original_price = responsePublicationDataJSON[0].body.original_price === null ? price : responsePublicationDataJSON[0].body.original_price
    const available_quantity = responsePublicationDataJSON[0].body.available_quantity ?? 0
    const thumbnail = responsePublicationDataJSON[0].body.thumbnail
    const permalink = responsePublicationDataJSON[0].body.permalink
    const listing_type_id = responsePublicationDataJSON[0].body.listing_type_id
    const logistic_type = responsePublicationDataJSON[0].body.shipping.logistic_type
    const self_service = responsePublicationDataJSON[0].body.self_service
    const free_shipping = responsePublicationDataJSON[0].body.shipping.free_shipping
    const mandatory_free_shipping = responsePublicationDataJSON[0].body.shipping?.tags?.includes('mandatory_free_shipping')
    const local_pick_up = responsePublicationDataJSON[0].body.shipping.local_pick_up
    // LLamamos al servicio para almacenar la informacion
    await dbConnector.savePublication(user, seller_id, item_id, title, status, sub_status, price, original_price, available_quantity,
      thumbnail, permalink, listing_type_id, logistic_type, self_service, free_shipping, mandatory_free_shipping, local_pick_up)

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
