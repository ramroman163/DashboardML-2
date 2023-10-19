const pc = require('picocolors')
const dbConnectorService = require('../controllers/dbConnector.js')

// El usuario de la tabla "users" está relacionado con sus cuentas de vendedor de la tabla "ml_sellers" mediante el "user.id" que
// se encuentra replicado en "ml_sellers.id"

function getSellers (userId) {
  return new Promise((resolve, reject) => {
    const querySellers = `SELECT seller_id, nickname FROM ml_sellers WHERE usuario = ${userId}`
    dbConnectorService.connectDbDashboard.query(querySellers, (error, result, filed) => {
      if (error) {
        console.error(pc.red('Error obteniendo sellers de la base de datos: ', error))
        reject(error)
      } else {
        console.log('Resultado de perfiles por usuario: ')
        resolve(result)
      }
    })
  })
}

module.exports = {
  getSellers
}
