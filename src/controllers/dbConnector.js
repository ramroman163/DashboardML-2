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

// 1- await Hacer consulta a ML
// 2- await Guardar algo en la DB
// 3- Responder al usuario

// Almacenar información de usuario
function saveUserData(access_token, refresh_token, user_id, user) {
    return new Promise((resolv, reject) => {
        const sql_query = `INSERT INTO ml_sellers (id, seller_id, usuario, token, refresh_token) VALUES (${null}, ${user_id}, ${user}, "${access_token}", "${refresh_token}")`;

        connectorDbDashboard.query(sql_query, (err, result, filed) => {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                //console.log("Resultado de almacenar tokens: ")
                //console.log(result);
                resolv(result);
            }
        })
    });
}

function savePublication(seller_id, item_id, title, status, sub_status, price, original_price, available_quantity, thumbnail, permalink, listing_type_id, logistic_type, self_service, free_shipping, mandatory_free_shipping, local_pick_up){
    return new Promise((resolv, reject) => {
        const sql_query = `INSERT INTO ml_items (id, usuario, seller_id, item_id, title, status, sub_status, price, original_price, available_quantity, thumbnail, permalink, listing_type_id, logistic_type, self_service, free_shipping, mandatory_free_shipping, local_pick_up) VALUES 
        (${null}, ${1}, "${seller_id}", "${item_id}", "${title}", "${status}", "${sub_status}", ${price}, ${0}, ${available_quantity}, "${thumbnail}", "${permalink}", "${listing_type_id}", "${logistic_type}", ${0}, ${0}, ${0}, ${0})`;
        //Fijarse los tipos de datos
        connectorDbDashboard.query(sql_query, (err, result, filed) => {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                resolv(result);
            }
        })
    });
}

// Exportaciones
module.exports = {
    connectDbDashboard: connectorDbDashboard,
    connectDb: connectDb,
    saveUserData: saveUserData,
    savePublication: savePublication
}