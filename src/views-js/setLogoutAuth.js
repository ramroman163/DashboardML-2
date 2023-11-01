const logoutURL = 'https://www.mercadolibre.com/jms/mla/lgz/logout?go='

const APP_ID = '4080755184952911'
const REDIRECT = 'http://localhost:3000/auth'
// const url = `https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=${APP_ID}&redirect_uri=${REDIRECT}`

// const finalURL = logoutURL + url

// Creamos y pasamos el link al boton de vincular cuenta de nuevo
document.querySelector('.redirect__logout_auth').setAttribute('href', logoutURL)
