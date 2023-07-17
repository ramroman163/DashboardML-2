// Imports
const mysql = require("mysql");

// Configuración de la BD
const connectorDbDashboard = mysql.createConnection(
    {
        host: "localhost",
        port: 3307,
        user: "admin",
        password: "admin",
        database: "dashboard_ml_bd"
    }
)

// Establecer conexión con la BD
const connectDb = () => {
    connectorDbDashboard.connect(err => {
        if(err) throw err;
        console.log("Conectado");
    })
}

// Almacenar información de usuario
function saveUserData(access_token, refresh_token, user_id, user){
    const sql_query = `INSERT INTO ml_sellers (id, seller_id, usuario, token, refresh_token) VALUES (${null}, ${user_id}, ${user}, "${access_token}", "${refresh_token}")`;
    connectorDbDashboard.query(sql_query, (err, result, filed) => {
        if(err) throw err;
        console.log("Resultado de almacenar tokens: ")
        console.log(result);
    })
}

function savePublications(){

}

// Exportaciones
module.exports = {
    connectDbDashboard: connectorDbDashboard,
    connectDb: connectDb,
    saveUserData: saveUserData
}