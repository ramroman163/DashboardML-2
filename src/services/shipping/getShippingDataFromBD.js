const dbConnectorService = require('../../controllers/dbConnector.js')
const pc = require('picocolors')

function getShippingIdFromBD (sessionSellerId, sessionUserId) {
  return new Promise((resolve, reject) => {
    const sql = `SELECT shipping_id FROM ml_orders WHERE seller_id = ${sessionSellerId} AND usuario = ${sessionUserId}`

    dbConnectorService.connectDbDashboard.query(sql, (error, result, filed) => {
      if (error) {
        console.error(pc.red('Error al obtener shpping ids de la BD'))
        reject(error)
      }

      resolve(result)
    })
  })
}

module.exports = {
  getShippingIdFromBD
}
