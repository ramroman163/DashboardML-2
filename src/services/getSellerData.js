// Imports
const request = require("request");
const dbConnector = require("../controllers/dbConnector.js");

function setRequestDataSeller(access_token, seller_id){
    const headers = {
        'Authorization': `Bearer: ${access_token}`
    };

    const options = {
        url: `https://api.mercadolibre.com/users/${seller_id}`,
        headers: headers
    }

    return options;
}

async function asyncCallback(error, response, body){
    if(error) throw error;
    const responseSellerDataJSON = JSON.parse(body);
    //console.log(responseSellerDataJSON);

    if(response.statusCode === 200 && responseSellerDataJSON.id){
        // Normal seller data
        const seller_id = responseSellerDataJSON.id;
        const nickname = responseSellerDataJSON.nickname;
        const country_id = responseSellerDataJSON.country_id; // País
        const first_name = responseSellerDataJSON.first_name;
        const last_name = responseSellerDataJSON.last_name;
        const email = responseSellerDataJSON.email;
        // Reputation data
        const seller_experience = responseSellerDataJSON.seller_experience; // ?
        const total_transactions = responseSellerDataJSON.seller_reputation?.transactions?.total; // Total de transacciones
        const completed_transactions = responseSellerDataJSON.seller_reputation?.transactions?.completed; // Total de transacciones COMPLETADAS
        const canceled_transactions = responseSellerDataJSON.seller_reputation?.transactions?.canceled; // Total de transacciones CANCELADAS
        const reputation_level = responseSellerDataJSON.seller_reputation?.level_id; // Nivel de reputación, númerico + color termometro
        const positive_rating_transactions = responseSellerDataJSON.seller_reputation?.transactions?.ratings?.positive; // Porcentaje de transacciones positivas 
        const negative_rating_transactions = responseSellerDataJSON.seller_reputation?.transactions?.ratings?.negative; // Porcentaje de transacciones negativas
        const neutral_rating_transactions = responseSellerDataJSON.seller_reputation?.transactions?.ratings?.neutral; // Porcentaje de transacciones neutras
        const seller_level_status = responseSellerDataJSON.seller_reputation?.power_seller_status; // Nivel de status del vendedor, como platinum o gold
        
        const sellerDataObject = {
            seller_id,
            nickname,
            country_id,
            first_name,
            last_name,
            email,
            seller_experience,
            total_transactions,
            completed_transactions,
            canceled_transactions,
            reputation_level,
            positive_rating_transactions,
            negative_rating_transactions,
            neutral_rating_transactions,
            seller_level_status
        }

        try {
            await dbConnector.saveSellerData(sellerDataObject);
            return "Se ha guardado el nickname del seller exitosamente.";
        } catch (error) {
            return "Error al guardar el nickname del seller."
        }
    }
}

function doAsyncRequestSellerData(requestOptions, asyncCallback){
    return new Promise((resolv, reject) => {
        request(requestOptions, (error, response, body) => {
            asyncCallback(error, response, body)
                .then((res) => resolv(res))
                .catch((error) => reject(error))
        });
    });
}

module.exports = {
    setRequestDataSeller,
    asyncCallback,
    doAsyncRequestSellerData
}