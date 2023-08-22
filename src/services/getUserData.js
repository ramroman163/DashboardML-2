const mysql = require("mysql");
const dbConnectorService = require("../controllers/dbConnector.js");

// Hacer query: dbConnectorService.connectorDbDashboard.query(sql_query, (error, result, filed) => {})

function getToken(user) {
    return new Promise((resolv, reject) => {
        let updateQuery = `SELECT token, refresh_token, seller_id FROM ml_sellers WHERE usuario = ${user}`;
        dbConnectorService.connectDbDashboard.query(updateQuery, (err, result, filed) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                console.log("# Resultado de UPDATE: ")
                resolv(result);
            }
        })
    })
}

function getUsers(user) {
    return new Promise((resolv, reject) => {
        let updateQuery = `SELECT username, password, id FROM usuarios WHERE username = "${user}"`;
        dbConnectorService.connectDbDashboard.query(updateQuery, (err, result, filed) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                console.log("# Resultado de UPDATE: ")
                resolv(result);
            }
        })
    })
}

module.exports = {
    getToken: getToken,
    getUsers: getUsers
}