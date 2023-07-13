let access_token = "";
let refresh_token = "";

function saveAccessToken(){
    // Código para guardar en SQL
    // ...
    console.log("Almacenando access_token...")
}

function saveRefreshToken(){
    // Código para guardar en SQL
    // ...
    console.log("Almacenando refresh_token...")
}

function setAccessToken(value){
    console.log(value);
    access_token = value;
    saveAccessToken(access_token);
}

function setRefreshToken(value){
    console.log(value);
    refresh_token = value;
    saveRefreshToken(refresh_token);
}

function getAccessToken(){
    return access_token;
}

function getRefreshToken(){
    return access_token;
}

module.exports.saveAccessToken = saveAccessToken;
module.exports.saveRefreshToken = saveRefreshToken;
module.exports.getAccessToken = getAccessToken;
module.exports.getRefreshToken = getRefreshToken;
module.exports.setRefreshToken = setRefreshToken;
module.exports.setAccessToken = setAccessToken;