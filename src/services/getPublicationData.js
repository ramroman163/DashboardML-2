let request = require('request');
let dbConnector = require("../controllers/dbConnector.js")

function setRequestDataPublications(access_token, publication_id){
    //const attributes = "seller_id,item_id,title,status,sub_status,price,original_price,available_quantity,thumbnail,permalink,listing_type_id,logistic_type,self_service,free_shipping,mandatory_free_shipping,local_pick_up"

    const headers = {
        'Authorization': `Bearer: ${access_token}`
    };

    const options = {
        // url: `https://api.mercadolibre.com/items?ids=${publication_id}&attributes=${attributes}`,
        url: `https://api.mercadolibre.com/items?ids=${publication_id}`,
        headers: headers
    }
    
    return options;
}

async function asyncCallback(error, response, body){
    if(error) throw error;

    const responsePublicationDataJSON = JSON.parse(body); //pasamos el body a JSON
    
    if(response.statusCode == 200){ 
        const seller_id = responsePublicationDataJSON[0].body.seller_id
        const item_id = responsePublicationDataJSON[0].body.item_id
        const title = responsePublicationDataJSON[0].body.title
        const status = responsePublicationDataJSON[0].body.status
        const sub_status = responsePublicationDataJSON[0].body.sub_status
        const price = responsePublicationDataJSON[0].body.price
        const original_price = responsePublicationDataJSON[0].body.original_price
        const available_quantity = responsePublicationDataJSON[0].body.available_quantity
        const thumbnail = responsePublicationDataJSON[0].body.thumbnail
        const permalink = responsePublicationDataJSON[0].body.permalink
        const listing_type_id = responsePublicationDataJSON[0].body.listing_type_id
        const logistic_type = responsePublicationDataJSON[0].body.logistic_type
        const self_service = responsePublicationDataJSON[0].body.self_service
        const free_shipping = responsePublicationDataJSON[0].body.free_shipping
        const mandatory_free_shipping = responsePublicationDataJSON[0].body.mandatory_free_shipping
        const local_pick_up = responsePublicationDataJSON[0].body.local_pick_up

        dbConnector.savePublication(seller_id, item_id, title, status, sub_status, price, original_price, available_quantity, thumbnail, permalink, listing_type_id, logistic_type, self_service, free_shipping, mandatory_free_shipping, local_pick_up)
        return response.statusCode;
    }
    else{
        throw new Error("No se pudo obtener la información");
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
    setRequestDataPublications: setRequestDataPublications,
    asyncCallback: asyncCallback,
    doAsyncRequest: doAsyncRequest
}