function setRequestPublications(access_token, user_id, scroll_id){

    const headers = {
        'Authorization': `Bearer: ${access_token}`
    };

    const options = {
        url: `https://api.mercadolibre.com/users/${user_id}/items/search?search_type=scan&scroll_id=${scroll_id}`,
        headers: headers
    }
    
    return options;
}

module.exports = {
    setRequestPublications: setRequestPublications
}