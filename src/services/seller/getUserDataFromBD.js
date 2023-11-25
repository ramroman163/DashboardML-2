const dbConnectorService = require('../../controllers/dbConnector.js')

// Hacer query: dbConnectorService.connectDbDashboard.query(sql_query, (error, result, filed) => {})

function getSellerToken (sellerId) {
  return new Promise((resolve, reject) => {
    const updateQuery = `SELECT token, refresh_token, seller_id FROM ml_sellers WHERE seller_id = "${sellerId}"`
    dbConnectorService.connectDbDashboard.query(updateQuery, (err, result, filed) => {
      if (err) {
        console.log(err)
        reject(err)
      } else {
        // console.log('Resultado de funcion getSellerToken (BD): ')
        resolve(result)
      }
    })
  })
}

function getUsers (user) {
  return new Promise((resolve, reject) => {
    const updateQuery = `SELECT username, password, id FROM usuarios WHERE username = "${user}"`
    dbConnectorService.connectDbDashboard.query(updateQuery, (err, result, filed) => {
      if (err) {
        console.log(err)
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
}

module.exports = {
  getSellerToken,
  getUsers
}
