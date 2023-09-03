let request = require('request');

function setRequestProfile(access_token, seller_id){
    const URL = `https://api.mercadolibre.com/users/${seller_id}`;
    
    let headers = {                                     
        'Authorization': `Bearer ${access_token}`           
    };  

    let options = {                                         
        url: URL,                                           
        headers: headers                                    
    };

    return options;
}

async function asyncCallbackProfile(error, response, body){
    if(error) throw error;
    
    const responseJSON = JSON.parse(body);

    if(responseJSON.nickname){
        return {
            nickname: responseJSON.nickname,
            statusCode: response.statusCode
        };
    } else {
        throw new Error("No se obtuvo el nickname del perfil")
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
    setRequestProfile: setRequestProfile,
    asyncCallbackProfile: asyncCallbackProfile,
    doAsyncRequestProfile: doAsyncRequestProfile
}