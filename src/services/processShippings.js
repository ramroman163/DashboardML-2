const { getShippingIdFromBD } = require('./getShippingDataFromBD.js')
const getShippingDataFromMLService = require('./getShippingDataFromML.js')
const pc = require('picocolors')
const getUserDataService = require('./getUserDataFromBD.js')

async function processShippings (sessionSellerId, sessionUserId) {
  console.log(pc.bgMagenta('PROCESO SHIPPINGS'))
  const userData = await getUserDataService.getSellerToken(sessionSellerId)

  const { token: accessToken, refresh_token: refreshToken, seller_id: sellerId } = userData[0]

  console.log('AT: ', accessToken, 'RT: ', refreshToken, 'UD: ', sellerId)

  const shippingIds = await getShippingIdFromBD(sessionSellerId, sessionUserId)
  console.log('Shipping ID obtenidas: ', shippingIds)
  await Promise.all(
    shippingIds.map(async (shippingObject) => {
      const optionsRequest = getShippingDataFromMLService.setOptions(shippingObject.shipping_id, accessToken)
      console.log(optionsRequest)
      await getShippingDataFromMLService.doAsyncCallback(optionsRequest, getShippingDataFromMLService.asyncCallback, sessionUserId)
    })
  )

  return {
    message: 'Shippings procesadas'
  }
}

module.exports = {
  processShippings
}
