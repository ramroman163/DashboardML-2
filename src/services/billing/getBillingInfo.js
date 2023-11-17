const pc = require('picocolors')
const request = require('request')

function setOptions (accessToken, orderId) {
  const headers = {
    Authorization: `Bearer ${accessToken}`
  }

  const options = {
    headers,
    url: `https://api.mercadolibre.com/orders/${orderId}/billing_info`
  }

  return options
}

async function asyncCallback (error, result, body) {
  if (error) {
    console.error(pc.bgRed('Error en getBillingInfo'))
    throw error
  }
  console.log(result)
  try {
    const billingJSON = JSON.parse(body)
    console.log(pc.bgMagenta('Billing JSON: '))
    console.log(billingJSON)
    if (result.statusCode === 200 && billingJSON.results > 0) {
      console.log(pc.cyan('Billing info: '), billingJSON)
      // return billingJSON
    } else {
      console.log(pc.red('No se obtuvo nada en billing. Status code: '), result.statusCode)
    }
  } catch (error) {
    // console.error(pc.bgRed('Error al procesar info en getBillingInfo'), error)
    console.error(pc.bgRed('Error al procesar info en getBillingInfo'))
  }
}

function doAsyncCallback (requestOptions, asyncRequestCallback) {
  return new Promise((resolve, reject) => {
    request(requestOptions, (error, result, body) => {
      asyncRequestCallback(error, result, body)
        .then((value) => resolve(value))
        .catch((error) => reject(error))
    })
  })
}

module.exports = {
  setOptions,
  asyncCallback,
  doAsyncCallback
}
