// Imports
let request = require('request');
let dbConnector = require("../controllers/dbConnector.js");

// Variables
let code = "";
let client_secret = "sKAwWnBSHRH4Plg2UmAvPnPYHg9NL9fZ";


//let rta; (maybe deprecated checkThisComment)

//el code es un código único del usuario, este es su setter
function setCode(value) {
    code = value; 
    console.log("Code obtenido: " + code);
}

//getter de la variable code
function getCode() {
    return code;
}

//getter de la variable client_secret
function getClientSecret(){
    return client_secret;
}

// Configuracion de peticion
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
/*
function callback(error, response, body) {
    if (error) throw error;
    
    console.log("Resultado de obtener token: " + response.statusCode);
    //consoleamos estado de la consulta

    const responseJSON = JSON.parse(body);

    if(responseJSON.access_token){
        // Ya tenemos los access_token, refresh_token y user_id
        let access_token = responseJSON.access_token;
        let refresh_token = responseJSON.refresh_token;
        let user_id = responseJSON.user_id;
        let user = 1;
        //ya seteamos el access token, refresh token y user id en función del body recibido.
        console.log("Almacenamos token");
        dbConnector.saveUserData(access_token, refresh_token, user_id, user);
        //Guardamos los datos del usuario en la db
    }
    //console.log('TEST: =>' + responseJSON.access_token);
    //rta = responseJSON.access_token; (checkThisComment)
}*/

async function asyncCallback(error, response, body) {
    //versión asincrona del callback
    if (error) throw error;
    console.log("Resultado de obtener token: " + response.statusCode);
    const responseJSON = JSON.parse(body);

    if (responseJSON.access_token) {
        // Ya tenemos los access_token, refresh_token y user_id
        let access_token = responseJSON.access_token;
        let refresh_token = responseJSON.refresh_token;
        let user_id = responseJSON.user_id;
        let user = 1;
        //ya seteamos el access token, refresh token y user id en función del body recibido.
        console.log("Almacenamos token");
        await dbConnector.saveUserData(access_token, refresh_token, user_id, user);
        //Guardamos los datos del usuario en la db
        return responseJSON;
    } else {
        throw new Error("Sin access token");
    }
}

function doAsyncRequest(requestOptions, asyncRequestCallback) {     // 
    return new Promise((resolve, reject) => {                       //   
        request(requestOptions, (error, response, body) => {        //  que
            asyncRequestCallback(error, response, body)             //  
                .then((value) => resolve(value))                    //  es
                .catch((error) => reject(error))                    //  
        });                                                         //  esto
    });                                                             //
}                                                                   // (checkThisComment)

//function doRequest(requestOptions, requestCallback) {
//    request(requestOptions, requestCallback);
//} 
//(checkThisComment)

//function printRta(){
//    console.log(rta)
//}
//(checkThisComment)

//export de todas las variables y funciones del archivo getToken.js
module.exports.getCode = getCode;
module.exports.setCode = setCode;
module.exports.getClientSecret = getClientSecret;
module.exports.setRequest = setRequest;
// module.exports.callback = callback; checkThisComment
//module.exports.doRequest = doRequest; checkThisComment
// module.exports.rta = rta;
// module.exports.printRta = printRta; (checkThisComment)

module.exports.doAsyncRequest = doAsyncRequest;
module.exports.asyncCallback = asyncCallback;