// Imports
const express = require("express");
const path = require("path");
const request = require('request');

const getTokenService = require("./src/services/getToken.js")
const getPublicationsService = require("./src/services/getPublications.js");

const dbController = require("./src/controllers/dbConnector.js");

// Constantes
const PORT = 3000;
const app = express();

// Seteamos motor de vistas y rutas
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));
app.use(express.static(path.join(__dirname, "src/views-js")));

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
    const code = req.query.code;
    const client_secret = getTokenService.getClientSecret();
    const requestOptions = getTokenService.setRequest(code, client_secret);

    await getTokenService.doRequest(requestOptions, getTokenService.callback);
    
    const id = 1;
    const sql_query = `SELECT token FROM ml_sellers WHERE usuario = "${id}"`;
    
    dbController.connectDbDashboard.query(sql_query, (error, result, filed) => {
        if(error){
            res.render("index.ejs", {state: "Error vinculando"});
            throw error;
        }

        let cantidadTokens = result.length;
        console.log("# Cantidad de tokens: " + cantidadTokens);
        const access_token = result[cantidadTokens-1].token;

        console.log("# Token obtenido de consulta: " + access_token);
        const URL = "https://api.mercadolibre.com/users/me";

        let headers = {
            'Authorization': `Bearer ${access_token}`
        };

        let options = {
            url: URL,
            headers: headers
        };
        console.log("# Opciones de request para nickname: ")
        console.log(options);
        request(options, (error, response, body) => {
            if(error) throw error;
            
            const responseJSON = JSON.parse(body);
            if(responseJSON.nickname && response.statusCode == 200){
                res.render("index.ejs", {state: responseJSON.nickname});
                user = responseJSON.nickname;
                return;
            }
            else{
                console.log("# Respuesta de obtener nickname: ")
                console.log(responseJSON);
                res.render("index.ejs", {state: "Acceso invalido"});
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

        let cantidadTokens = result.length;
        console.log("# Cantidad de tokens: " + cantidadTokens);
        const userInfo = result[cantidadTokens-1];

        console.log("# Token y ID obtenido de consulta: " + userInfo.token, + " " + userInfo.seller_id);

        const requestOptionsPublications = getPublicationsService.setRequestPublications(userInfo.token, userInfo.seller_id);

        request(requestOptionsPublications, (error, response, body) => {
            if(error){
                res.json({
                    result: "Ocurrió un error"
                })
                throw error;
            }

            const responsePublicationsJSON = JSON.parse(body);

            if(response.statusCode == 200 && responsePublicationsJSON.results.length > 0){
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