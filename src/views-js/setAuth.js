const APP_ID = "4080755184952911"
const REDIRECT = "http://localhost:3000/auth"
let url = `https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=${APP_ID}&redirect_uri=${REDIRECT}`

document.querySelector(".redirect__auth").setAttribute("href", url);
