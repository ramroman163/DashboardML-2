const express = require("express");
const path = require("path");
const app = express();
const { setCode, doRequest, options } = require("./src/services/getToken.js")

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
    console.log(req.query)
    const code = req.query.code;
    console.log(code);  
    setCode(code);
    doRequest(options);
    res.render("index.ejs");
})