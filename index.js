// Imports

// // Importamos todo lo de routing y request
const express = require("express");
const path = require("path");
const request = require("request");
const session = require("express-session")

// // Importamos nuestros servicios
const getTokenService = require("./src/services/getToken.js")
const getPublicationsService = require("./src/services/getPublications.js");
const getPublicationDataService = require("./src/services/getPublicationData.js")

// // Importamos nuestro controlador de BD
const dbController = require("./src/controllers/dbConnector.js");

// Constantes
const PORT = 3000; // Puerto de app
const app = express();  // Aplicación básica de express

// Sesion 

app.use(session({
    // Mas adelante utilizamos una propiedad token
    secret: "mi_secreto",
    resave: false,
    saveUninitialized: true
}))

// Seteamos motor de vistas y rutas
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));
app.use(express.static(path.join(__dirname, "src/views-js")));
// El uso de path nos permite que esto corra tanto en windows como linux, debe contener un "__dirname"


// Iniciamos servidor
app.listen(PORT, () => {
    //Iniciamos conexion con la BD
    dbController.connectDb();
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
})

// Peticion a /
app.get("/", (req, res) => {
    // Revisamos si tenemos almacenado el nickname en la sesion y renderizamos
    req.session.nickname ? res.render("index.ejs", { state: req.session.nickname }) : res.render("index.ejs", { state: "No vinculado" });
})

// Peticion a /auth
app.get("/auth", async (req, res) => {
    
    const code = req.query.code;
    // Obtenemos el parametro code de la URL luego de que ML realice la autenticacion y nos redirija aquí
    
    const client_secret = getTokenService.getClientSecret();
    // Retorna la variable preexistente client_secret

    const requestOptions = getTokenService.setRequest(code, client_secret);
    // Armamos las options de la request de datos del usuario

    try {   // Ejecutamos el request usando await y asincronia,
            // para poder estructurar el código bien sin frenar los procesos
        const tokenJSON = await getTokenService.doAsyncRequest(requestOptions, getTokenService.asyncCallback);
        
        // console.log("# Respuesta del getTokenService: ") Línea para debug
        // console.log(tokenJSON); Línea para debug

        // Eliminamos variables locales y reemplazamos por variables de session
        req.session.token = tokenJSON.access_token;
        req.session.user_id = tokenJSON.user_id;

        // console.log("# Session token: " + req.session.token); Línea para debug
          
        const URL = "https://api.mercadolibre.com/users/me";

        let headers = {                                         // seteo y 
            'Authorization': `Bearer ${req.session.token}`      // control 
        };                                                      // de la 
        let options = {                                         // creación
            url: URL,                                           // del paquete
            headers: headers                                    // HTTP
        };                                                      // para setear
                                                                // las options
                                                                // de la request
        
        // console.log("# Opciones de request para nickname: ") Línea para debug
        // console.log(options); Línea para debug

        request(options, (error, response, body) => {
            
            if(error) throw error; // Si hay un error, lo lanzamos
            
            const responseJSON = JSON.parse(body); // Parseamos a un objeto el JSON de la respuesta
            if(responseJSON.nickname && response.statusCode == 200){ // Si hay nickname y el statusCode es 200
                req.session.nickname = responseJSON.nickname // Almacenamos nickname en la session
                res.render("index.ejs", {state: req.session.nickname}); // Renderizamos el index.ejs con el nickname obtenido
                
                return;
            }
            else{
                console.log("# Respuesta de obtener nickname: "); // Si no hay nombre o da otro statusCode falla
                console.log(responseJSON); // Cargar en consola el responseJSON (en busca de encontrar los errores)
                res.render("index.ejs", {state: "Acceso invalido"}); // Renderizamos el index.ejs con state Acceso inválido
            }
        });

    } catch (err) {
        // Renderizamos el index.ejs con state "Error vinculando" en caso de error
        res.render("index.ejs", { state: "Error vinculando" }); 
        console.log(err);
    }
})

app.get("/sync", async (req, res) => {
    console.log("Session token en sync: " + req.session.token); // Línea para debug
    console.log("Session user_id en sync: " + req.session.user_id); // Línea para debug
    console.log("\n"); // Línea para debug

    let publications = [] // Array que contendrá los id de publicaciones

    let scroll_id = "" // Variable que almacenará el scroll_id una vez obtenido
    
    while(true){
        const requestOptionsPublications = getPublicationsService.setRequestPublications(req.session.token, req.session.user_id, scroll_id); 
        // Seteamos las opciones de la consulta de publicaciones con el token e id del usuario
        // Aclaramos que en la primera iteración del bucle el scroll_id será un string vacio ""
        
        // Realizamos la consulta y obtener un objeto con el scroll_id y los id de publicaciones obtenidas
        responseRequestPublications = await getPublicationsService.doAsyncRequest(requestOptionsPublications, getPublicationsService.asyncCallback)

        scroll_id = responseRequestPublications.scroll_id; // Seteamos el scroll_id

        if(scroll_id == null || scroll_id == undefined) break; // Cuando no hay más paginación salimos del bucle

        // Concatenamos los ids obtenidos con los existentes
        publications = publications.concat(responseRequestPublications.publications_id); 
    }

    if(publications.length){ // Si tenemos ids, realizamos las consultas para obtener la informacion y guardarla en la BD

        publications.forEach(async (id) => {
            const requestOptionsPublicationData = getPublicationDataService.setRequestDataPublications(req.session.token, id);
            const statusCode = await getPublicationDataService.doAsyncRequest(requestOptionsPublicationData, getPublicationDataService.asyncCallback)

            console.log(statusCode);
        })

        res.json({
            "result": "Publicaciones obtenidas" // Respuesta que se envía al js del index
        })
    }
    else{
        res.json({
            "result": "No se obtuvo ninguna publicación" // Respuesta que se envía al js del index
        })
    }

})