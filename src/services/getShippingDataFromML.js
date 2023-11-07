const request = require('request')
const pc = require('picocolors')
const { saveShippingData } = require('../controllers/dbConnector')

function setOptions (shippingId, accessToken) {
  const headers = {
    Authorization: `Bearer ${accessToken}`
  }

  const options = {
    headers,
    url: `https://api.mercadolibre.com/shipments/${shippingId}`
  }

  return options
}

async function asyncCallback (error, response, body, sessionUserId) {
  if (error) {
    console.error(pc.red('Error en response de shippings'))
    throw error
  }

  try {
    const responseShipping = JSON.parse(body)

    if (response.statusCode === 200 && responseShipping.id) {
      console.log(responseShipping)
      const shippingObject = {
        usuario: sessionUserId,
        seller_id: responseShipping.sender_id,
        shipping_id: responseShipping.id,
        state_id: responseShipping.receiver_address?.state?.id,
        state_name: responseShipping.receiver_address?.state?.name,
        status: responseShipping.status,
        date_created: responseShipping.date_created,
        country_id: responseShipping.receiver_address?.country?.id,
        country_name: responseShipping.receiver_address?.country?.name,
        city_name: responseShipping.receiver_address?.city?.name,
        lat: responseShipping.receiver_address?.latitude,
        long: responseShipping.receiver_address?.longitude,
        address_line: responseShipping.receiver_address?.address_line,
        base_cost: responseShipping.base_cost
      }
      console.log(shippingObject)
      await saveShippingData(shippingObject, sessionUserId)
      return {
        processed: true
      }
    } else {
      console.error('Error en la respuesta obtenida de shippings: ', response.statusCode)
      return {
        processed: false
      }
    }
  } catch (error) {
    console.error(pc.red('Error al procesar response de shippings', error))
    throw error
  }
}

function doAsyncCallback (requestOptions, asyncCallback, sessionUserId) {
  return new Promise((resolve, reject) => {
    request(requestOptions, (error, response, body) => {
      asyncCallback(error, response, body, sessionUserId)
        .then(data => resolve(data))
        .catch(err => reject(err))
    })
  })
}

module.exports = {
  setOptions,
  asyncCallback,
  doAsyncCallback
}
