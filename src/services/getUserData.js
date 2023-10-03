const dbConnectorService = require("../controllers/dbConnector.js");

// Hacer query: dbConnectorService.connectDbDashboard.query(sql_query, (error, result, filed) => {})

function getToken(seller_id) {
    return new Promise((resolv, reject) => {
        const updateQuery = `SELECT token, refresh_token, seller_id FROM ml_sellers WHERE seller_id = "${seller_id}"`;
        dbConnectorService.connectDbDashboard.query(updateQuery, (err, result, filed) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                console.log("Resultado de funcion getToken: ")
                resolv(result);
            }
        })
    })
}

function getUsers(user) {
    return new Promise((resolv, reject) => {
        const updateQuery = `SELECT username, password, id FROM usuarios WHERE username = "${user}"`;
        dbConnectorService.connectDbDashboard.query(updateQuery, (err, result, filed) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                console.log("Resultado de UPDATE de funcion getUsers: ")
                resolv(result);
            }
        })
    })
}

module.exports = {
    getToken,
    getUsers
}