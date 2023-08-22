// Imports

// Importamos todo lo de routing, express y login
const express = require("express");
const path = require("path");
const request = require("request");
const session = require("express-session");
const bcryptjs = require("bcryptjs");
const dotenv = require("dotenv");

// Seteamos el archivo .env
dotenv.config({ path: './src/env/.env' });

// // Importamos nuestros servicios
const getTokenService = require("./src/services/getToken.js")
const getPublicationsService = require("./src/services/getPublications.js");
const getPublicationDataService = require("./src/services/getPublicationData.js")
const getUserDataService = require("./src/services/getUserData.js")
const sellers = require("./src/services/sellers.js");

// // Importamos nuestro controlador de BD
const dbController = require("./src/controllers/dbConnector.js");

// Constantes
const PORT = 3000; // Puerto de app
const app = express();  // Aplicación básica de express

// ?
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Sesion 
app.use(session({
    // Mas adelante utilizamos una propiedad token
    secret: "mi_secreto",
    resave: true,
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
    req.session.user ? res.render("index.ejs", { state: req.session.nickname }) : res.render("login.ejs");
    // Revisamos si tenemos almacenado el nickname en la sesion y renderizamos
    // req.session.nickname ? res.render("index.ejs", { state: req.session.nickname }) : res.render("index.ejs", { state: "No vinculado" });
})

// Peticion a /auth para vinculacion
app.get("/auth", async (req, res) => {


    if (!req.session.user || req.session.user == 0) {
        res.render("login.ejs");
    }

    const code = req.query.code;
    // Obtenemos el parametro code de la URL luego de que ML realice la autenticacion y nos redirija aquí

    const client_secret = getTokenService.getClientSecret();
    // Retorna la variable preexistente client_secret

    const requestOptions = getTokenService.setRequest(code, client_secret);
    // Armamos las options de la request de datos del usuario

    try {   // Ejecutamos el request usando await y asincronia,
        // para poder estructurar el código bien sin frenar los procesos
        await getTokenService.doAsyncRequest(requestOptions, getTokenService.asyncCallback);

        // console.log("# Respuesta del getTokenService: ") Línea para debug
        // console.log(tokenJSON); Línea para debug

        // Eliminamos variables locales y reemplazamos por variables de session
        //req.session.token = tokenJSON.access_token;
        //req.session.seller_id = tokenJSON.user_id;
        //req.session.refresh_token = tokenJSON.refresh_token;

        req.session.user = 1;
        console.log("# Return del getUserData: ")
        const userData = await getUserDataService.getToken(req.session.user);
        console.log(userData)

        const access_token = userData[0].token;
        const refresh_token = userData[0].refresh_token;
        const seller_id = userData[0].seller_id;

        // console.log("# Session token: " + req.session.token); Línea para debug

        const URL = "https://api.mercadolibre.com/users/me";

        let headers = {                                         // seteo y 
            'Authorization': `Bearer ${access_token}`           // control 
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

            if (error) throw error; // Si hay un error, lo lanzamos

            const responseJSON = JSON.parse(body); // Parseamos a un objeto el JSON de la respuesta
            if (responseJSON.nickname && response.statusCode == 200) { // Si hay nickname y el statusCode es 200
                req.session.nickname = responseJSON.nickname // Almacenamos nickname en la session
                res.render("index.ejs", { state: req.session.nickname }); // Renderizamos el index.ejs con el nickname obtenido

                return;
            }
            else {
                console.log("# Respuesta de obtener nickname: "); // Si no hay nombre o da otro statusCode falla
                console.log(responseJSON); // Cargar en consola el responseJSON (en busca de encontrar los errores)
                res.render("index.ejs", { state: "Acceso invalido" }); // Renderizamos el index.ejs con state Acceso inválido
            }
        });

    } catch (err) {
        // Renderizamos el index.ejs con state "Error vinculando" en caso de error
        res.render("index.ejs", { state: "Error vinculando" });
        console.log(err);
    }
})

// Peticion a /auth para autorizacion de login
app.post("/auth", async (req, res) => {
    // Tomamos user y pass de la peticion post para login

    const username = req.body.username;
    const password = req.body.password;

    console.log("Data del login: " + username + " " + password);

    //let passwordHashed = await bcryptjs.hash(password, 12);


    if (username && password) { //si hay nombre de usuario y contraseña
        const results = await getUserDataService.getUsers(username);//solicitamos todas las contraseñas de la base de datos cuyo nombre de usuario coincida con el enviado por la función para poder comparar.
        console.log("Resultado de consulta info usuario:")
        console.log(results[0].password)
        console.log(results[0].id);
        console.log("RESULTADO DE COMPARAR bien o mal (");
        console.log(await bcryptjs.compare(password, results[0].password));

        if (results.length == 0 || !(await bcryptjs.compare(password, results[0].password))) { //si no hay nada en base de datos o si los datos de la base de datos no coinci
            console.log("Usuario y/o contraseña incorrecta");
            res.send("burro");
        } else {
            console.log("Inicio de sesión correcto");
            //res.send("GOD");
            req.session.user = results[0].id;//hasta acá ya comprobamos que funciona.
            res.render("index.ejs", { state: "Sin vincular" })
        }
    } else { //si no hay nombre de usuario o contraseña
        console.log("error de ingreso de datos.")
        res.send('Por favor, ingrese un nombre de usuario y contraseña válidos.')
    }
})

app.get("/sync", async (req, res) => {

    if (!req.session.user) {
        res.json({
            "result": "Tenés que iniciar sesión primero" // Respuesta que se envía al js del index
        })

        return;
    }

    let perfiles = [];
    perfiles = await sellers.getSellers(req.session.user);

    console.log("# Return del getUserData en SYNC: ")
    const userData = await getUserDataService.getToken(req.session.user);

    let access_token = userData[0].token;
    console.log(`AT: ${userData[0].token}`)
    let refresh_token = userData[0].refresh_token;
    console.log(`RT: ${userData[0].refresh_token}`)
    let seller_id = userData[0].seller_id;
    console.log(`UD: ${userData[0].seller_id}`)

    let publications = [] // Array que contendrá los id de publicaciones

    let scroll_id = "" // Variable que almacenará el scroll_id una vez obtenido

    while (true) {
        try {
            console.log("Entro al while")
            // Seteamos las opciones de la consulta de publicaciones con el token e id del usuario
            // Aclaramos que en la primera iteración del bucle el scroll_id será un string vacio ""
            const requestOptionsPublications = getPublicationsService.setRequestPublications(access_token, seller_id, scroll_id);

            // Realizamos la consulta y obtener un objeto con el scroll_id y los id de publicaciones obtenidas
            responseRequestPublications = await getPublicationsService.doAsyncRequest(requestOptionsPublications, getPublicationsService.asyncCallback)

            if (responseRequestPublications.statusCode == 403 || responseRequestPublications.statusCode == 400) {
                console.log(`# Se obtuvo un status code de ${responseRequestPublications.statusCode} en publications`);

                const requestOptionsRefresh = getTokenService.setRequestRefresh(getTokenService.getClientSecret(), refresh_token)

                try {
                    const responseRefreshToken = await getTokenService.doAsyncRequestRefresh(requestOptionsRefresh, getTokenService.asyncCallbackRefresh, req.session.user);
                    if (responseRefreshToken.access_token) {
                        access_token = responseRefreshToken.access_token;
                        refresh_token = responseRefreshToken.refresh_token;
                        seller_id = responseRefreshToken.user_id;

                        console.log(`AT: ${access_token} RT: ${refresh_token} UD: ${seller_id}`)
                        continue;
                    }
                    else {
                        throw new Error("No se obtuvo ningun access token en el refresh!")
                    }
                } catch (error) {
                    continue;
                }
            }

            scroll_id = responseRequestPublications.scroll_id; // Seteamos el scroll_id

            if (scroll_id == null || scroll_id == undefined) break; // Cuando no hay más paginación salimos del bucle

            // Concatenamos los ids obtenidos con los existentes
            publications = publications.concat(responseRequestPublications.publications_id);
        } catch (error) {

        }

    }

    if (publications.length) { // Si tenemos ids, realizamos las consultas para obtener la informacion y guardarla en la BD

        publications.forEach(async (id) => {
            const requestOptionsPublicationData = getPublicationDataService.setRequestDataPublications(access_token, id);
            const statusCode = await getPublicationDataService.doAsyncRequest(requestOptionsPublicationData, getPublicationDataService.asyncCallback, req.session.user)

            console.log(statusCode);
        })

        res.json({
            "result": "Publicaciones obtenidas" // Respuesta que se envía al js del index
        })
    }
    else {
        res.json({
            "result": "No se obtuvo ninguna publicación" // Respuesta que se envía al js del index
        })
    }

})



