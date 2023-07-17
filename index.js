// Imports

// //import routing
const express = require("express");
const path = require("path");
const request = require('request');

// //import our files
const getTokenService = require("./src/services/getToken.js")
const getPublicationsService = require("./src/services/getPublications.js");

// //import our DB controller
const dbController = require("./src/controllers/dbConnector.js");

// Constantes
const PORT = 3000; //puerto de DB
const app = express();  //aplicación básica de express

// Seteamos motor de vistas y rutas
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));
app.use(express.static(path.join(__dirname, "src/views-js")));
//el uso de path nos permite que esto corra tanto en windows como linux, debe contener un "__dirname"


// Iniciamos servidor
app.listen(PORT, () => {
    dbController.connectDb();
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
})

// Peticion a /
app.get("/", (req, res) => {
    res.render("index.ejs", {state: "No vinculado"});
})

// Peticion a /auth
app.get("/auth", async (req, res) => {
    
    //denominamos getTokenService al file que maneja los datos del usuario
    
    const code = req.query.code;
    //getea el "code" de la URL (checkThisComment)
    
    const client_secret = getTokenService.getClientSecret();
    //retorna la variable preexistente client_secret

    const requestOptions = getTokenService.setRequest(code, client_secret);
    //armamos el request de datos del usuario


    try {   //ejecutamos el request, usamos await y asincronia
            //para poder estructurar el código bien sin frenar los procesos
        const resp = await getTokenService.doAsyncRequest(requestOptions, getTokenService.asyncCallback);
        console.log(resp);
    } catch (err) {
        console.log(err);
    }

    //console.log('macs =>' + resp);

    //await getTokenService.doRequest(requestOptions, getTokenService.callback); (checkThiscomment)

    //let variable = await getTokenService.rta;
    
    //getTokenService.printRta();

    const id = 1; //usamos id = 1 porque nos estamos manejando con un solo usuario en la db
    const sql_query = `SELECT token FROM ml_sellers WHERE usuario = "${id}"`;
    //solicitamos a la db el token del usuario cuyo id coincida con nuestro usuario actual (1)


    //conectamos a la base de datos
    dbController.connectDbDashboard.query(sql_query, (error, result, filed) => {
        if(error){
            res.render("index.ejs", {state: "Error vinculando"});
            throw error;

            //si hay algún error se renderiza la página pero se setea el state a error de vinculación
            //se throwea el error
        }

        let cantidadTokens = result.length; //geteamos la cantidad de tokens para despues llamar al último
        //console.log("# Cantidad de tokens: " + cantidadTokens);*/
        const access_token = result[cantidadTokens-1].token; //llamamos al último token almacenado

        console.log("# Token obtenido de consulta: " + access_token); //control de estado de consulta
        const URL = "https://api.mercadolibre.com/users/me";



        let headers = {                                         // seteo y 
            'Authorization': `Bearer ${access_token}`           // control 
        };                                                      // de la 
        let options = {                                         // creación
            url: URL,                                           // del paquet
            headers: headers                                    // HTTP
        };                                                      // para solicitar
        console.log("# Opciones de request para nickname: ")    // las options
        console.log(options);                                   // desde token
        
        
        
        request(options, (error, response, body) => {
            
            if(error) throw error; //autoexplained
            
            const responseJSON = JSON.parse(body); //no sé de donde sale el body, pero lo parseamos a JSON (checkThisComment)
            if(responseJSON.nickname && response.statusCode == 200){ //si hay nickname y el statusCode es 200 (bien) 
                res.render("index.ejs", {state: responseJSON.nickname}); //renderizar el index.ejs
                user = responseJSON.nickname;
                return;
            }
            else{
                console.log("# Respuesta de obtener nickname: "); //si no hay nombre o algo falla
                console.log(responseJSON); //cargar en consola el responseJSON (en busca de encontrar los errores)
                res.render("index.ejs", {state: "Acceso invalido"}); //renderizar con state Acceso inválido
            }
        });
    })
})

app.get("/sync", async (req, res) => {
    // const nickname = req.query.nickname;
    const id = req.query.id;
    const sql_query = `SELECT token, seller_id FROM ml_sellers WHERE usuario = "${id}"`;
    
    await dbController.connectDbDashboard.query(sql_query, (error, result, filed) => {
        if(error){
            throw error;
        }

        let cantidadTokens = result.length;             //corregir
        const userInfo = result[cantidadTokens-1];      //corregir
        //ya tenemos el token en la variable access_token de index.js linea 85

        console.log("# Token y ID obtenido de consulta: " + userInfo.token, + " " + userInfo.seller_id);

        const requestOptionsPublications = getPublicationsService.setRequestPublications(userInfo.token, userInfo.seller_id);
        //seteamos una consulta de publicaciones con el token e id del usuario

        request(requestOptionsPublications, (error, response, body) => {
            //llevamos a cabo la consulta 
            if(error){
                res.json({
                    result: "Ocurrió un error"
                })
                throw error;
            }

            const responsePublicationsJSON = JSON.parse(body); //pasamos el body a JSON

            if(response.statusCode == 200 && responsePublicationsJSON.results.length > 0){ //si sale todo bien y hay al menos una publicación
                //console.log(responsePublicationsJSON);
                res.json({
                    result: "Publicaciones vinculadas"
                })
            }
            else{
                console.log("No hay productos para almacenar");
                res.json({
                    result: "No se encontraron productos"
                })
            }
        })
    })
})