function buscarPublicaciones () {

  return new Promise((resolv, reject) => {
    try {
      connectorDbDashboard.query(`SELECT * FROM ml_items WHERE item_id = "${item_id}"`, (err, result, filed) => {
      })
    }
    catch (err) {
      print(err);
    }
  })
}