let request = require('request');

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

async function asyncCallback(error, response, body){
    if(error) throw error;

    const responsePublicationsJSON = JSON.parse(body); //pasamos el body a JSON

    if(response.statusCode == 200 && responsePublicationsJSON.results.length > 0){ //si sale todo bien y hay al menos una publicación
        // 1 Crear el almacenamiento en db
        // 2 Loopear la consulta cambiando el scroll_id de requestOptionsPublications
        // console.log("scroll calb: " + responsePublicationsJSON.scroll_id)
        return {
            scroll_id: responsePublicationsJSON.scroll_id,
            publications_id: responsePublicationsJSON.results 
        }
    }
    else{
        // console.log("Respuesta de status publications: ")
        // console.log(response.statusCode);
        return {
            scroll_id: null
        }
    }
}

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