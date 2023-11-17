// Imports
const getUserDataService = require('./getUserDataFromBD.js')
const getSellerDataFromMlService = require('./getSellerDataFromML.js')
const refreshSellerTokenService = require('./refreshSellerToken.js')
const pc = require('picocolors')

const commonStatusCodeErrors = [403, 400, 401]

// Chequeamos que el token del seller sea correcto (y actualizamos informacion personal)
async function checkSellerData (sessionSellerId, sessionUser) {
  let requestCounter = 0

  while (true) {
    if (requestCounter >= 5) {
      return {
        check: false,
        message: 'Error al comprobar usuarios (Max. intentos)'
      }
    }
    try {
      const authSellerData = await getUserDataService.getSellerToken(sessionSellerId) // Traemos data de auth del usuario

      console.log(pc.magenta(`Auth data del seller ${sessionSellerId}`), authSellerData)

      const { token: accessToken, refresh_token: refreshToken, seller_id: sellerId } = authSellerData[0]

      const requestOptionsSellerData = getSellerDataFromMlService.setRequest(accessToken, sellerId)

      const responseSellerData = await getSellerDataFromMlService.doRequest(requestOptionsSellerData, getSellerDataFromMlService.asyncCallback)
      console.log('Respuesta sellerData: ', responseSellerData)
      // Si la respuesta de obtener data del seller es incorrecta, se intenta renovar el token mediante el refresh
      if (commonStatusCodeErrors.includes(responseSellerData.statusCode)) {
        requestCounter++

        console.log(pc.yellow(`Status code ${responseSellerData.statusCode} en getSellerData`))

        refreshSellerTokenService.refreshSellerToken(refreshToken, sessionUser) ? console.log('Seller actualizado') : console.log('Error obteniendo refresh token')
      } else {
        return {
          check: true,
          message: 'Comprobación de usuario correcta'
        }
      }
    } catch {
      console.log(pc.red('Error al comprobar el seller'))
      return {
        check: true,
        message: 'Comprobación de usuario incorrecta'
      }
    }
  }
}

module.exports = {
  checkSellerData
}
