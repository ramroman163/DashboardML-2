const getUserDataService = require('../seller/getUserDataFromBD.js')
const getOrdersFromMLService = require('./getOrdersFromML.js')
const getTokenService = require('../seller/getTokenFromML.js')
const pc = require('picocolors')
const { saveOrderData } = require('../../controllers/dbConnector.js')

async function processOrders (sessionSellerId, sessionUserId, eventEmitter, progressStatus) {
  console.log(pc.bgMagenta('PROCESO ORDERS'))
  const userData = await getUserDataService.getSellerToken(sessionSellerId)

  let { token: accessToken, refresh_token: refreshToken, seller_id: sellerId } = userData[0]

  // console.log('AT: ', accessToken, 'RT: ', refreshToken, 'UD: ', sellerId)

  if (!accessToken && !refreshToken) {
    console.log('No se obtuvo ninguna credencial para sincronizar.')

    return {
      result: 'Sin credenciales para sincronizar'
    }
  }

  let orders = []
  progressStatus.progressOrders = 0
  let scrollId = '' // Variable que almacenará el scroll_id una vez obtenido
  let requestCounter = 0
  const commonStatusCodeErrors = [403, 400, 401]

  while (true) {
    if (requestCounter >= 5) {
      break
    }

    try {
      const requestOptionsOrders = getOrdersFromMLService.setRequest(accessToken, scrollId, sellerId)
      const responseRequestOrders = await getOrdersFromMLService.doAsyncRequest(requestOptionsOrders, getOrdersFromMLService.asyncCallback, accessToken, sessionUserId)

      if (commonStatusCodeErrors.includes(responseRequestOrders.statusCode)) {
        console.log(`Se obtuvo un status code de ${responseRequestOrders.statusCode} en obtener orders`)
        if (responseRequestOrders.statusCode === 400) {
          requestCounter++
        }
        const requestOptionsRefresh = getTokenService.setRequestRefresh(getTokenService.getClientSecret(), refreshToken)

        try {
          const responseRefreshToken = await getTokenService.doAsyncRequestRefresh(requestOptionsRefresh, getTokenService.asyncCallbackRefresh, sessionUserId)
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
      const responseOrders = responseRequestOrders.orderData
      const totalOrders = responseRequestOrders.totalOrders
      const partialOrders = responseRequestOrders.partialOrders
      scrollId = responseRequestOrders.scrollId // Seteamos el scroll_id

      if (responseOrders) {
        orders = [...orders, ...responseOrders]
        progressStatus.progressOrders += Math.round(100 / (totalOrders / partialOrders))
        eventEmitter.emit('progress', progressStatus)
      }

      if (scrollId === null || scrollId === undefined) break // Cuando no hay más paginación salimos del bucle
    } catch (error) {
      console.log(pc.red('Error inesperado al obtener orders:', error))
      console.log(error)
    }
  }
  console.log(pc.gray('Orders array: '), orders.length)

  if (orders.length) {
    console.log(pc.bgBlue('Ordenes obtenidas: '), orders.length)

    await Promise.all(
      orders.map(async (orderObject) => {
        await saveOrderData(orderObject)
      })
    )
  } else if (requestCounter >= 5) {
    console.error(pc.bgRed('Error al obtener ordenes'))
    return {
      message: 'Error al obtener ordenes'
    }
  } else {
    console.log(pc.bgMagenta('No se obtuvo ninguna orden'))
  }

  return {
    message: `Ordenes obtenidas: ${orders.length}`
  }
}

module.exports = {
  processOrders
}
