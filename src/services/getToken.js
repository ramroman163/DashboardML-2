const request = require("request");

const APP_ID = "4080755184952911";
const REDIRECT = "http://localhost:3000/auth";

let code = "";
let client_secret = "sKAwWnBSHRH4Plg2UmAvPnPYHg9NL9fZ";

function setCode(value){
    code = value;
}

let options = {
    method: 'POST',
    url: 'https://api.mercadolibre.com/oauth/token',
    headers: {
        'accept': 'application/json',
        'content-type': 'application/x-www-form-urlencoded'
    },
    form: {
        'grant_type': 'authorization_code',
        'client_id': "4080755184952911",
        'client_secret': "sKAwWnBSHRH4Plg2UmAvPnPYHg9NL9fZ",
        'code': `${code}`,
        'redirect_uri': "http://localhost:3000/auth"
    }
};

function doRequest(options){
    request(options, function (error, response) {
        if (error) throw new Error(error);
        console.log(response.body);
    });
}

module.exports.setCode = setCode;
module.exports.doRequest = doRequest;
module.exports.options = options;