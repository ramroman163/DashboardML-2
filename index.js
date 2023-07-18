// Imports

// // Import routing
const express = require("express");
const path = require("path");
const request = require("request");
const session = require("express-session")

// // Import our files
const getTokenService = require("./src/services/getToken.js")
const getPublicationsService = require("./src/services/getPublications.js");

// // Import our DB controller
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
    dbController.connectDb();
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
})

// Peticion a /
app.get("/", (req, res) => {
    res.render("index.ejs", { state: "No vinculado" });
})

// Peticion a /auth
app.get("/auth", async (req, res) => {

    // Denominamos getTokenService al file que maneja los datos del usuario
    
    const code = req.query.code;
    // Getea el "code" de la URL (checkThisComment)
    
    const client_secret = getTokenService.getClientSecret();
    // Retorna la variable preexistente client_secret

    const requestOptions = getTokenService.setRequest(code, client_secret);
    // Armamos el request de datos del usuario

    try {   // Ejecutamos el request, usamos await y asincronia
            // Para poder estructurar el código bien sin frenar los procesos
        const tokenJSON = await getTokenService.doAsyncRequest(requestOptions, getTokenService.asyncCallback);
        console.log("# Respuesta del getTokenService: ")
        console.log(tokenJSON);

        // Eliminamos variables locales y reemplazamos por variables de session
        req.session.token = tokenJSON.access_token;
        req.session.user_id = tokenJSON.user_id;

        console.log("Session token: " + req.session.token);
        /*
        console.log("# Token obtenido: " + access_token); //control de estado de consulta
        console.log("# User Id obtenido: " + user_id); //control de estado de consulta
        */  
        const URL = "https://api.mercadolibre.com/users/me";


        let headers = {                                         // seteo y 
            'Authorization': `Bearer ${req.session.token}`           // control 
        };                                                      // de la 
        let options = {                                         // creación
            url: URL,                                           // del paquete
            headers: headers                                    // HTTP
        };                                                      // para setear
        console.log("# Opciones de request para nickname: ")    // las options
        console.log(options);                                   // de la request


        request(options, (error, response, body) => {
            
            if(error) throw error; //autoexplained
            
            const responseJSON = JSON.parse(body); // Parseamos a JSON el body de la respuesta
            if(responseJSON.nickname && response.statusCode == 200){ // Si hay nickname y el statusCode es 200 (bien) 
                res.render("index.ejs", {state: responseJSON.nickname}); // Renderizar el index.ejs
                user = responseJSON.nickname;
                return;
            }
            else{
                console.log("# Respuesta de obtener nickname: "); // Si no hay nombre o da otro statusCode falla
                console.log(responseJSON); // Cargar en consola el responseJSON (en busca de encontrar los errores)
                res.render("index.ejs", {state: "Acceso invalido"}); // Renderizar con state Acceso inválido
            }
        });

    } catch (err) {
        res.render("index.ejs", { state: "Error vinculando" });
        console.log(err);
    }
})

app.get("/sync", async (req, res) => {
    console.log("Session token en sync: " + req.session.token);
    console.log("Session user_id en sync: " + req.session.user_id);

    const requestOptionsPublications = getPublicationsService.setRequestPublications(req.session.token, req.session.user_id, "");
        //seteamos una consulta de publicaciones con el token e id del usuario
    console.log("Parameters publications: ");
    console.log(requestOptionsPublications);

    request(requestOptionsPublications, (error, response, body) => { //llevamos a cabo la consulta 
        if(error){
            res.json({
                result: "Ocurrió un error"
            })
            throw error;
        }

        const responsePublicationsJSON = JSON.parse(body); //pasamos el body a JSON

        if(response.statusCode == 200 && responsePublicationsJSON.results.length > 0){ //si sale todo bien y hay al menos una publicación
            
            res.json({
                result: "Publicaciones vinculadas"
            })

            // 1 Crear el almacenamiento en db
            // 2 Loopear la consulta cambiando el scroll_id de requestOptionsPublications
        }
        else{
            console.log("Respuesta de status pub: ")
            console.log(response.statusCode);
            console.log("No hay productos para almacenar");
            res.json({
                result: "No se encontraron productos"
            })
        }
    })
})