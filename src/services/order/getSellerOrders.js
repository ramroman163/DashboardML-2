const dbConnector = require('../../controllers/dbConnector.js')
const pc = require('picocolors')

function getSellerOrders (sellerId) {
  return new Promise((resolve, reject) => {
    const query = `SELECT order_id, date_closed, item_title, total_amount, item_quantity, last_sincro FROM ml_orders WHERE seller_id = ${sellerId}`

    dbConnector.connectDbDashboard.query(query, (error, results, filed) => {
      if (error) {
        console.error(pc.red('Error al ejecutar la consulta de publicaciones: ', error))
        reject(error)
      } else {
        console.log('Ordenes del usuario:')
        results.forEach((item) => {
          console.log(`ORDER_ID: ${item.order_id}, DATE_CLOSED: ${item.date_close}, TITLE: ${item.item_title}, TOTAL_AMOUNT: ${item.total_amount}, QUANTITY: ${item.item_quantity} LAST_SINCRO: ${item.last_sincro}`)
        })
        resolve(results)
      }
    })
  })
}

module.exports = {
  getSellerOrders
}
