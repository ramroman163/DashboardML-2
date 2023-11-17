const getUserDataService = require('../seller/getUserDataFromBD.js')
const getPublicationsService = require('./getPublicationsFromML.js')
const getTokenService = require('../seller/getTokenFromML.js')
const pc = require('picocolors')

async function processPublications (sessionSellerId, sessionUserId) {
  const userData = await getUserDataService.getSellerToken(sessionSellerId)
  console.log(userData)
  let { token: accessToken, refresh_token: refreshToken, seller_id: sellerId } = userData[0]

  // let accessToken = userData[0].token // let refresh_token = userData[0].refresh_token // let seller_id = userData[0].seller_id

  console.log('AT: ', accessToken, 'RT: ', refreshToken, 'UD: ', sellerId)

  /*
        Si no existe ninguna credencial => linea 272
        Si existe SOLO accessToken, se debe probar si sigue valido y tratar de obtener un refreshToken
        Si existe SOLO un refreshToken, se debe saltar a lo de adentro del if línea 306
  */

  if (!accessToken && !refreshToken) {
    console.log('No se obtuvo ninguna credencial para sincronizar.')

    return {
      result: 'Sin credenciales para sincronizar'
    }
  }

  let publications = [] // Array que contendrá los id de publicaciones

  let scrollId = '' // Variable que almacenará el scroll_id una vez obtenido
  let requestCounter = 0
  const commonStatusCodeErrors = [403, 400, 401]

  while (true) {
    if (requestCounter >= 5) {
      break
    }

    try {
      console.log('Entro al while')
      // Seteamos las opciones de la consulta de publicaciones con el token e id del usuario
      // Aclaramos que en la primera iteración del bucle el scroll_id será un string vacio ""
      const requestOptionsPublications = getPublicationsService.setRequestPublications(accessToken, sellerId, scrollId)
      // Realizamos la consulta y obtener un objeto con el scroll_id y los id de publicaciones obtenidas
      const responseRequestPublications = await getPublicationsService.doAsyncRequest(requestOptionsPublications, getPublicationsService.asyncCallback)

      if (commonStatusCodeErrors.includes(responseRequestPublications.statusCode)) {
        console.log(`Se obtuvo un status code de ${responseRequestPublications.statusCode} en obtener publications`)
        if (responseRequestPublications.statusCode === 400) {
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

      scrollId = responseRequestPublications.scroll_id // Seteamos el scroll_id

      if (scrollId === null || scrollId === undefined) break // Cuando no hay más paginación salimos del bucle

      // Concatenamos los ids obtenidos con los existentes
      publications = publications.concat(responseRequestPublications.publications_id)
    } catch (error) {
      console.log(pc.red('Error inesperado al obtener publicaciones:', error))
      console.log(error)
    }
  }

  return {
    publications,
    requestCounter,
    accessToken
  }
}

module.exports = {
  processPublications
}
