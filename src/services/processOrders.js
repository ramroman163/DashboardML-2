// Por ahora no se usa...

const getUserDataService = require('./getUserDataFromBD.js')
const getOrdersFromMLService = require('./getOrdersFromML.js')
const getTokenService = require('./getTokenFromML.js')
const pc = require('picocolors')

async function processOrders (sessionSellerId, sessionUserId) {
  console.log(pc.bgMagenta('PROCESO ORDERS'))
  const userData = await getUserDataService.getSellerToken(sessionSellerId)

  let { token: accessToken, refresh_token: refreshToken, seller_id: sellerId } = userData[0]

  console.log('AT: ', accessToken, 'RT: ', refreshToken, 'UD: ', sellerId)

  if (!accessToken && !refreshToken) {
    console.log('No se obtuvo ninguna credencial para sincronizar.')

    return {
      result: 'Sin credenciales para sincronizar'
    }
  }

  const orders = []

  let scrollId = '' // Variable que almacenará el scroll_id una vez obtenido
  let requestCounter = 0
  const commonStatusCodeErrors = [403, 400, 401]

  while (true) {
    if (requestCounter >= 5) {
      break
    }

    try {
      console.log('Entro al while')

      const requestOptionsOrders = getOrdersFromMLService.setRequest(accessToken, scrollId, sellerId)

      const responseRequestOrders = await getOrdersFromMLService.doAsyncRequest(requestOptionsOrders, getOrdersFromMLService.asyncCallback, accessToken)

      if (commonStatusCodeErrors.includes(responseRequestOrders.statusCode)) {
        console.log(`Se obtuvo un status code de ${responseRequestOrders.statusCode} en obtener publications`)
        if (responseRequestOrders.statusCode === 400) {
          requestCounter++
        }
        const requestOptionsRefresh = getTokenService.setRequestRefresh(getTokenService.getClientSecret(), refreshToken)

        try {
          const responseRefreshToken = await getTokenService.doAsyncRequestRefresh(requestOptionsRefresh, getTokenService.asyncCallbackRefresh, sessionUserId)
          console.log(responseRefreshToken)
          if (responseRefreshToken.access_token) {
            accessToken = responseRefreshToken.access_token
            refreshToken = responseRefreshToken.refresh_token
            sellerId = responseRefreshToken.user_id

            console.log(`AT: ${accessToken} RT: ${refreshToken} UD: ${sellerId}`)
            continue
          } else {
            throw new Error('No se obtuvo ningun access token en el refresh')
          }
        } catch (err) {
          console.log(pc.red('Error al obtener access token en el refresh: ', err))
        }
      }

      scrollId = responseRequestOrders.scroll_id // Seteamos el scroll_id

      // console.log(pc.gray('response array: '))
      // console.log(responseRequestOrders.orderData)
      // Concatenamos los ids obtenidos con los existentes
      orders.push(responseRequestOrders.orderData)

      if (scrollId === null || scrollId === undefined) break // Cuando no hay más paginación salimos del bucle
    } catch (error) {
      console.log(pc.red('Error inesperado al obtener orders:', error))
      console.log(error)
    }
  }
  // console.log(pc.gray('Orders array: '))
  // console.log(orders)
  return {
    orders,
    requestCounter,
    accessToken
  }
}

module.exports = {
  processOrders
}
