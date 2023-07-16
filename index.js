// Imports
const express = require("express");
const path = require("path");
const app = express();
const getTokenService = require("./src/services/getToken.js")
//const getAccountDataService = require("./src/services/getAccountData.js");
const dbController = require("./src/controllers/dbConnector.js");
let request = require('request');

// Puerto
const PORT = 3000;

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
    console.log("Obtuvimos token");
    const id = 1;
    const sql_query = `SELECT token FROM ml_sellers WHERE usuario = "${id}"`;
    
    dbController.connectDbDashboard.query(sql_query, (error, result, filed) => {
        if(error){
            res.render("index.ejs", {state: "Error vinculando"});
            throw error;
        }

        let cantidadTokens = result.length;
        console.log("Cantidad de tokens: " + cantidadTokens);
        const access_token = result[cantidadTokens-1].token;

        console.log(access_token);
        const URL = "https://api.mercadolibre.com/users/me";

        let headers = {
            'Authorization': `Bearer ${access_token}`
        };

        let options = {
            url: URL,
            headers: headers
        };
        console.log(options);
        request(options, (error, response, body) => {
            if(error) throw error;
            
            const responseJSON = JSON.parse(body);
            if(responseJSON.nickname && response.statusCode == 200){
                res.render("index.ejs", {state: responseJSON.nickname});
                return;
            }
            else{
                console.log(responseJSON);
                res.render("index.ejs", {state: "Acceso invalido"});
            }
        });
    })
})