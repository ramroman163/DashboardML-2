const dbController = require("../controllers/dbConnector.js");

function getSellerInfo(id){
    return new Promise((resolv, reject) => {
        const sql_query = `SELECT token, seller_id FROM ml_sellers WHERE usuario = "${id}"`;
    
        dbController.connectDbDashboard.query(sql_query, (err, result, filed) => {
            if(err){
                console.error(err);
                reject(err);
            } else {
                let cantidadTokens = result.length;             
                const userInfo = result[cantidadTokens-1];
                
                console.log("# Token y ID obtenido de consulta: " + userInfo.token, + " " + userInfo.seller_id);
                
                resolv(userInfo);
            }
        })
    })
}