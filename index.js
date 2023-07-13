const express = require("express");
const path = require("path");
const app = express();
const getTokenService = require("./src/services/getToken.js")

const PORT = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));
app.use(express.static(path.join(__dirname, "src/views-js")));

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
})

app.get("/", (req, res) => {
    res.render("index.ejs");
})

app.get("/auth", (req, res) => {
    const code = req.query.code;
    const client_secret = getTokenService.getClientSecret();
    const requestOptions = getTokenService.setRequest(code, client_secret);

    getTokenService.doRequest(requestOptions, getTokenService.callback);

    res.render("index.ejs");
})