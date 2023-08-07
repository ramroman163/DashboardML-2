// Imports
let request = require('request');

// Funcion para setear las options de la request
function setRequestPublications(access_token, user_id, scroll_id){

    const headers = {
        'Authorization': `Bearer: ${access_token}`
    };

    const options = {
        url: `https://api.mercadolibre.com/users/${user_id}/items/search?search_type=scan&limit=2&scroll_id=${scroll_id}`,
        headers: headers
    }
    
    return options;
}

// Callback asíncrono, donde parseamos el JSON y retornamos el scroll_id junto a los ids obtenidos
async function asyncCallback(error, response, body){
    if(error) throw error;

    const responsePublicationsJSON = JSON.parse(body); // Pasamos el JSON del body a objeto
    console.log(responsePublicationsJSON);
    // Si obtenemos un statusCode de 200 y hay al menos una publicación
    if(response.statusCode == 200 && responsePublicationsJSON.results.length > 0){ 
        // console.log("Scroll callback: " + responsePublicationsJSON.scroll_id) Línea para debug
        return {
            statusCode: responsePublicationsJSON.statusCode,
            scroll_id: responsePublicationsJSON.scroll_id,
            publications_id: responsePublicationsJSON.results 
        }
    }
    else{
        // console.log("Respuesta de status publications: ") Línea para debug
        // console.log(response.statusCode); Línea para debug
        return {
            statusCode: response.statusCode,
            scroll_id: null
        }
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

module.exports = {
    setRequestPublications: setRequestPublications,
    doAsyncRequest: doAsyncRequest,
    asyncCallback: asyncCallback
}