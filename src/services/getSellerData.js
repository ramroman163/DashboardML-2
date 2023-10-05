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

// modificada con ia
async function asyncCallback(error, response, body){
    if(error){
        console.error("Error:", error);
        throw error;
    }
    
    if(response.statusCode !== 200){
        console.error("(Callback getSellerData)-Código de estado no válido:", response.statusCode);
        return "Código de estado no válido en la respuesta.";
    }

    try {
        const responseSellerDataJSON = JSON.parse(body);
        //console.log(responseSellerDataJSON);
    
        const sellerDataObject = {
            // Normal seller data
            seller_id: responseSellerDataJSON.id,
            nickname: responseSellerDataJSON.nickname,
            country_id: responseSellerDataJSON.country_id, // País
            first_name: responseSellerDataJSON.first_name,
            last_name: responseSellerDataJSON.last_name,
            email: responseSellerDataJSON.email,
            // Reputation data
            seller_experience: responseSellerDataJSON.seller_experience, // ?
            total_transactions: responseSellerDataJSON.seller_reputation?.transactions?.total, // Total de transacciones
            completed_transactions: responseSellerDataJSON.seller_reputation?.transactions?.completed, // Total de transacciones COMPLETADAS
            canceled_transactions: responseSellerDataJSON.seller_reputation?.transactions?.canceled, // Total de transacciones CANCELADAS
            reputation_level: responseSellerDataJSON.seller_reputation?.level_id, // Nivel de reputación, númerico + color termometro
            positive_rating_transactions: responseSellerDataJSON.seller_reputation?.transactions?.ratings?.positive, // Porcentaje de transacciones positivas
            negative_rating_transactions: responseSellerDataJSON.seller_reputation?.transactions?.ratings?.negative, // Porcentaje de transacciones negativas
            neutral_rating_transactions: responseSellerDataJSON.seller_reputation?.transactions?.ratings?.neutral, // Porcentaje de transacciones neutras
            seller_level_status: responseSellerDataJSON.seller_reputation?.power_seller_status // Nivel de status del vendedor, como platinum o gold
        }

        await dbConnector.saveSellerData(sellerDataObject);
        return "Se ha guardado el nickname del seller exitosamente.";
        
    } catch (error) {
        console.error("(Callback getSellerData)-Error al guardar en base de datos o acceder al objeto:", error);
        return "Error al guardar el nickname del seller."
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