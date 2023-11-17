const getTokenService = require('./getTokenFromML.js')
const dbController = require('../../controllers/dbConnector.js')

async function refreshSellerToken (refreshToken, sessionUser) {
  const requestOptionsRefresh = getTokenService.setRequestRefresh(getTokenService.getClientSecret(), refreshToken)

  try {
    const responseRefreshToken = await getTokenService.doAsyncRequestRefresh(requestOptionsRefresh, getTokenService.asyncCallbackRefresh, sessionUser)

    if (responseRefreshToken.access_token && responseRefreshToken.refresh_token) {
      const { access_token: newAccessToken, refresh_token: newRefreshToken, user_id: newSellerId } = responseRefreshToken

      console.log(`New Access Token: ${newAccessToken}, Refresh Token: ${newRefreshToken} Seller Id: ${newSellerId}`)

      /* Cambiar el nombre de la función */
      dbController.saveUserData(newAccessToken, newRefreshToken, newSellerId, sessionUser)

      return { newAccessToken, newRefreshToken, newSellerId }
    } else {
      throw new Error('No se obtuvo ningun access token en el refresh!')
    }
  } catch (error) {
    return false
  }
}

module.exports = {
  refreshSellerToken
}
