// Imports
const mysql = require("mysql");

// Configuración de la BD
const connectorDbDashboard = mysql.createConnection(
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE
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
function saveUserData(access_token, refresh_token, user_id, user) { 
    return new Promise((resolv, reject) => {
        connectorDbDashboard.query(`SELECT * FROM ml_sellers WHERE seller_id = "${user_id}"`, (err, result, filed) => {
            //console.log(existingItem)
            if (err){
                console.log(err);
                reject(err);
            } else {
                if(result.length > 0){
                    console.log(`Ya existe el seller "${user_id}"`)
                    let updateQuery = `UPDATE ml_sellers SET token = "${access_token}", refresh_token = "${refresh_token}" WHERE seller_id = "${user_id}" AND usuario = ${user}`;
                    connectorDbDashboard.query(updateQuery, (err, result, filed) => {
                        if (err){
                            console.log(err);
                            reject(err);
                        } else {
                            console.log("# Resultado de UPDATE: ")
                            resolv (result);
                        }
                    })
                } else {
                    console.log(`Todavía no existe el seller "${user_id}"`)
                    let insertQuery = `INSERT INTO ml_sellers (seller_id, usuario, token, refresh_token) VALUES ("${user_id}", ${user}, "${access_token}", "${refresh_token}")`;
                    connectorDbDashboard.query(insertQuery, (err, result, filed) => {
                        if (err){
                            console.log(err);
                            reject(err);
                        } else {
                            console.log("# Resultado de INSERT: ")
                            resolv (result);
                        }
                    })
                }
                resolv (result);
            }
        });
    });
}

function updateUserData(access_token, refresh_token, seller_id, user_id){
    return new Promise((resolv, reject) => {
        const sql_query = `UPDATE ml_sellers SET token = "${access_token}", refresh_token = "${refresh_token}" WHERE seller_id = "${seller_id}" AND usuario = ${user_id}`;
        //incheckeable
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

// Almacenar información de publicación
function savePublication(user, seller_id, item_id, title, status, sub_status, price, original_price, available_quantity, thumbnail, permalink, listing_type_id, logistic_type, self_service, free_shipping, mandatory_free_shipping, local_pick_up){
    // self_service no lo encontramos en el json, lo dejamos con un 0
    return new Promise((resolv, reject) => {
        try{
            connectorDbDashboard.query(`SELECT * FROM ml_items WHERE item_id = "${item_id}"`, (err, result, filed) => {
                if (err){
                    console.log(err);
                    reject(err);
                } else {
                    if(result.length > 0){
                        console.log(`Ya existe el item "${item_id}"`)
                        let updateQuery = `UPDATE ml_items SET title = "${title}", status = "${status}", sub_status = "${sub_status}", price = ${price}, original_price = ${original_price}, available_quantity = ${available_quantity}, thumbnail = "${thumbnail}", permalink = "${permalink}", listing_type_id = "${listing_type_id}", logistic_type = "${logistic_type}", self_service = ${0}, free_shipping = ${free_shipping}, mandatory_free_shipping = ${mandatory_free_shipping}, local_pick_up = ${local_pick_up} WHERE item_id = "${item_id}"`;
                        connectorDbDashboard.query(updateQuery, (err, result, filed) => {
                            if (err){
                                console.log(err);
                                reject(err);
                            } else {
                                console.log("# Resultado de UPDATE: ")
                                resolv (result);
                            }
                        })
                    } else {
                        console.log(`Todavía no existe el item "${item_id}"`)
                        let insertQuery = `INSERT INTO ml_items (id, usuario, seller_id, item_id, title, status, sub_status, price, original_price, available_quantity, thumbnail, permalink, listing_type_id, logistic_type, self_service, free_shipping, mandatory_free_shipping, local_pick_up) VALUES (${null}, ${user}, "${seller_id}", "${item_id}", "${title}", "${status}", "${sub_status}", ${price}, ${original_price}, ${available_quantity}, "${thumbnail}", "${permalink}", "${listing_type_id}", "${logistic_type}", ${0}, ${free_shipping}, ${mandatory_free_shipping}, ${local_pick_up})`;
                        connectorDbDashboard.query(insertQuery, (err, result, filed) => {
                            if (err){
                                console.log(err);
                                reject(err);
                            } else {
                                console.log("# Resultado de INSERT: ")
                                resolv (result);
                            }
                        })
                    }
                    resolv (result);
                }
            });
        } catch (error){
            console.log(error)
        }

        /*const sql_query = `INSERT INTO ml_items (id, usuario, seller_id, item_id, title, status, sub_status, price, original_price, available_quantity, thumbnail, permalink, listing_type_id, logistic_type, self_service, free_shipping, mandatory_free_shipping, local_pick_up) VALUES 
        (${null}, ${1}, "${seller_id}", "${item_id}", "${title}", "${status}", "${sub_status}", ${price}, ${original_price}, ${available_quantity}, "${thumbnail}", "${permalink}", "${listing_type_id}", "${logistic_type}", ${0}, ${free_shipping}, ${mandatory_free_shipping}, ${local_pick_up})`;
        
        connectorDbDashboard.query(sql_query, (err, result, filed) => {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                resolv(result);
            }
        })*/
    });

    //item_id es mi dato a consultar, necesito que si el item_id existe, actualice
    


}

// Exportaciones
module.exports = {
    connectDbDashboard: connectorDbDashboard,
    connectDb: connectDb,
    saveUserData: saveUserData,
    savePublication: savePublication,
    updateUserData: updateUserData
}