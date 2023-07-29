// Imports
let request = require('request');
let dbConnector = require("../controllers/dbConnector.js");

// Variables
let client_secret = "sKAwWnBSHRH4Plg2UmAvPnPYHg9NL9fZ";

// Getter de la variable client_secret
function getClientSecret(){
    return client_secret;
}

// Funcion para setear las options de la request
function setRequest(code, client_secret) {
    const APP_ID = "4080755184952911";
    const REDIRECT = "http://localhost:3000/auth";
    const HEADERS = {
        'accept': 'application/json',
        'content-type': 'application/x-www-form-urlencoded'
    };

    let dataString = `grant_type=authorization_code&client_id=${APP_ID}&client_secret=${client_secret}&code=${code}&redirect_uri=${REDIRECT}`;

    let options = {
        url: 'https://api.mercadolibre.com/oauth/token',
        method: 'POST',
        headers: HEADERS,
        body: dataString
    };

    return options;
}

async function asyncCallback(error, response, body) {
    if (error) throw error;
    console.log("Resultado de obtener token: " + response.statusCode); // Línea para debug
    const responseJSON = JSON.parse(body); // Pasamos el JSON a un objeto

    if (responseJSON.access_token) {
        // Ya tenemos los access_token, refresh_token y user_id, los almacenamos en variables
        let access_token = responseJSON.access_token;
        let refresh_token = responseJSON.refresh_token;
        let user_id = responseJSON.user_id;
        let user = 1;
        
        console.log("Almacenamos token"); // Línea para debug

        await dbConnector.saveUserData(access_token, refresh_token, user_id, user); // Guardamos los datos del usuario en la db
        
        return responseJSON;
    } else {
        throw new Error("Sin access token");
    }
}

// Funcion para llamar al request
function doAsyncRequest(requestOptions, asyncRequestCallback) {     
    return new Promise((resolve, reject) => {                          
        request(requestOptions, (error, response, body) => {       
            asyncRequestCallback(error, response, body)             
                .then((value) => resolve(value))                 
                .catch((error) => reject(error))                    
        });                                                         
    });                                                             
}                                                                   

// Export de las funciones del archivo getToken.js
module.exports.getClientSecret = getClientSecret;
module.exports.setRequest = setRequest;
module.exports.doAsyncRequest = doAsyncRequest;
module.exports.asyncCallback = asyncCallback;