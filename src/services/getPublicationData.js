let request = require('request');
let dbConnector = require("../controllers/dbConnector.js")

function setRequestDataPublications(access_token, publication_id){
    const attributes = "seller_id,item_id,title,status,sub_status,price,original_price,available_quantity,thumbnail,permalink,listing_type_id,logistic_type,self_service,free_shipping,mandatory_free_shipping,local_pick_up"

    const headers = {
        'Authorization': `Bearer: ${access_token}`
    };

    const options = {
        url: `https://api.mercadolibre.com/items?ids=${publication_id}&attributes=${attributes}`,
        headers: headers
    }
    
    return options;
}

async function asyncCallback(error, response, body){
    if(error) throw error;

    const responsePublicationJSON = JSON.parse(body); //pasamos el body a JSON

    if(response.statusCode == 200){ 
        const seller_id = responsePublicationJSON.seller_id
        const item_id = responsePublicationJSON.item_id
        const title = responsePublicationJSON.title
        const status = responsePublicationJSON.status
        const sub_status = responsePublicationJSON.sub_status
        const price = responsePublicationJSON.price
        const original_price = responsePublicationJSON.original_price
        const available_quantity = responsePublicationJSON.available_quantity
        const thumbnail = responsePublicationJSON.thumbnail
        const permalink = responsePublicationJSON.permalink
        const listing_type_id = responsePublicationJSON.listing_type_id
        const logistic_type = responsePublicationJSON.logistic_type
        const self_service = responsePublicationJSON.self_service
        const free_shipping = responsePublicationJSON.free_shipping
        const mandatory_free_shipping = responsePublicationJSON.mandatory_free_shipping
        const local_pick_up = responsePublicationJSON.local_pick_up

        dbConnector.savePublication(seller_id, item_id, title, status, sub_status, price, original_price, available_quantity, thumbnail, permalink, listing_type_id, logistic_type, self_service, free_shipping, mandatory_free_shipping, local_pick_up)
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