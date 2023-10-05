// hace lo mismo que getSellerData!! ver.

const request = require('request');

function setRequestProfile(access_token, seller_id){
    const URL = `https://api.mercadolibre.com/users/${seller_id}`;
    
    const headers = {                                     
        'Authorization': `Bearer ${access_token}`           
    };  

    const options = {                                         
        url: URL,                                           
        headers: headers                                    
    };

    return options;
}

async function asyncCallbackProfile(error, response, body){
    if(error) throw error;
    
    const responseJSON = JSON.parse(body);
    console.log(`Respuesta profile: ${response.statusCode}`)
    if(responseJSON.nickname){
        return {
            nickname: responseJSON.nickname,
            statusCode: response.statusCode
        };
    } else {
        return {
            statusCode: response.statusCode
        }
    }
}

function doAsyncRequestProfile(requestProfilesOptions, asyncCallbackProfile){
    return new Promise((resolve, reject) => {
        request(requestProfilesOptions, (error, response, body) => {
            asyncCallbackProfile(error, response, body)
                .then((value) => resolve(value))
                .catch((error) => reject(error))
        });
    });
}

module.exports = {
    setRequestProfile,
    asyncCallbackProfile,
    doAsyncRequestProfile
}