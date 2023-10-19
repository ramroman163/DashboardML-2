// Imports
const getUserDataService = require('./getUserDataFromBD.js')
const getSellerDataFromMlService = require('./getSellerDataFromML.js')
const refreshSellerTokenService = require('./refreshSellerToken.js')
const pc = require('picocolors')

const commonStatusCodeErrors = [403, 400, 401]

// Chequeamos que el token de los sellers sea correcto (y actualizamos informacion personal)
async function checkSellersDataForHome (profiles, sessionUser) {
  const profilesState = {}

  await Promise.all(profiles.map(async (profile) => {
    let requestCounter = 0

    while (true) {
      if (requestCounter >= 5) {
        profilesState[profile.seller_id] = {
          state: 'not linked',
          nickname: profile.nickname
        }
        break
      }
      try {
        const authSellerData = await getUserDataService.getSellerToken(profile.seller_id)

        console.log(pc.magenta(`Auth data del seller ${profile.nickname}`), authSellerData)

        const { token: accessToken, refresh_token: refreshToken, seller_id: sellerId } = authSellerData[0]

        const requestOptionsSellerData = getSellerDataFromMlService.setRequest(accessToken, sellerId)

        const responseSellerData = await getSellerDataFromMlService.doRequest(requestOptionsSellerData, getSellerDataFromMlService.asyncCallback)
        console.log('Respuesta sellerData: ', responseSellerData)
        // Si la respuesta de obtener data del seller es incorrecta, se intenta renovar el token mediante el refresh
        if (commonStatusCodeErrors.includes(responseSellerData.statusCode)) {
          requestCounter++
          console.log(`Status code ${responseSellerData.statusCode} en getSellerData`)
          refreshSellerTokenService.refreshSellerToken(refreshToken, sessionUser) ? console.log('Seller actualizado') : profilesState[profile.seller_id] = { state: 'not linked', nickname: profile.nickname }
        } else {
          profilesState[profile.seller_id] = {
            state: 'linked',
            nickname: responseSellerData.nickname ?? profile.nickname
          }
          break
        }
      } catch {
        console.log(pc.red('Error al procesar los sellers'))
      }
    }
  }))
  // Se devuelven los perfiles con su estado actual y su nickname actualizado (si es posible)
  return profilesState
}

module.exports = {
  checkSellersDataForHome
}
