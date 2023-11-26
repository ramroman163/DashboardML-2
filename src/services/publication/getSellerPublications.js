const dbConnector = require('../../controllers/dbConnector.js')

// Función para obtener y mostrar las publicaciones de un usuario
function getSellerPublications (sellerId) {
  return new Promise((resolve, reject) => {
    const query = `SELECT item_id, title, price, status, last_sincro FROM ml_items WHERE seller_id = ${sellerId}`

    dbConnector.connectDbDashboard.query(query, (error, results, filed) => {
      if (error) {
        console.error('Error al ejecutar la consulta de publicaciones: ', error)
        reject(error)
      } else {
        console.log('Publicaciones del usuario:')
        results.forEach((item) => {
          console.log(`ITEM_ID: ${item.item_id}, TITLE: ${item.title}, PRICE: ${item.price}, STATUS: ${item.status}, LAST_SINCRO: ${item.last_sincro}`)
        })
        resolve(results)
      }
    })
  })
}

module.exports = {
  getSellerPublications
}