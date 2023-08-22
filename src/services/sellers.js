//El usuario de la tabla "users" está relacionado con sus cuentas de vendedor de la tabla "ml_sellers" mediante el "user.id" que 
//se encuentra replicado en "ml_sellers.id"



function getSellers(user_id) {

    return new Promise((resolv, reject) => {
        let nombres_usuarios = `SELECT nickname FROM ml_sellers WHERE id = ${user_id}`; //checkear.
        console.log(nombres_usuarios);
        dbConnectorService.connectDbDashboard.query(updateQuery, (err, result, filed) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                console.log("###Macs### => Resultado de perfiles por usuario: ")
                resolv(result);
            }
        })
    })
}


module.exports = {
    getSellers: getSellers
}
