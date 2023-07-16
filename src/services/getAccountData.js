let request = require('request');

// function getUserData(access_token, user_id){
//     const requestUserOptions = setRequest(access_token, user_id);
//     doRequest(requestUserOptions, callback);
// }

function setRequest(access_token, user_id) {
    const URL = `https://api.mercadolibre.com/users/${user_id}`;

    let HEADERS = {
        'Authorization': `Bearer ${access_token}`
    };

    let options = {
        url: URL,
        headers: HEADERS
    };

    return options;
}

function callback(error, response, body) {
    if (error) throw error;
    const responseJSON = JSON.parse(body);
    if(responseJSON.nickname){
        console.log(responseJSON);
    }
}

function doRequest(requestOptions, callback) {
    request(requestOptions, callback);
}

module.exports.setRequest = setRequest;
module.exports.callback = callback;
module.exports.doRequest = doRequest;