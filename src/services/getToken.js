// Imports
let request = require('request');
const saveTokenService = require("./saveToken.js");

// Variables
let code = "";
let client_secret = "sKAwWnBSHRH4Plg2UmAvPnPYHg9NL9fZ";

function setCode(value) {
    code = value;
    console.log("Code obtenido: " + code);
}

function getCode() {
    return code;
}

function getClientSecret(){
    return client_secret;
}

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

function callback(error, response, body) {
    if (error) throw error;
    
    console.log(response.statusCode);

    const responseJSON = JSON.parse(body);

    if(responseJSON.access_token){
        saveTokenService.setAccessToken(responseJSON.access_token);
        saveTokenService.setRefreshToken(responseJSON.refresh_token);
    }
}

function doRequest(requestOptions, requestCallback) {
    request(requestOptions, requestCallback);
}

module.exports.getCode = getCode;
module.exports.setCode = setCode;
module.exports.getClientSecret = getClientSecret;
module.exports.setRequest = setRequest;
module.exports.callback = callback;
module.exports.doRequest = doRequest;