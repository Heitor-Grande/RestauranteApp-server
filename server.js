const express = require("express")
const app = express()
require('dotenv').config()

//cors
const cors = require("cors")
app.use(cors())

//body-parser
const bodyParser = require("body-parser")
app.use(bodyParser.json({limit: '10mb'}))

//porta rodando o servidor
const porta = process.env.PORT || process.env.PORTA_DEV
app.listen(porta, function(){
    console.log("SERVIDOR RODANDO EM: http://localhost:" + porta)
})

//routes
const welcome = require("./controllers/welcome")
const criarJWT = require("./controllers/JwebToken")
const categorias = require("./controllers/categorias")
const produtos = require("./controllers/produtos")
const mesas = require("./controllers/mesas")
app.use(welcome)
app.use(criarJWT)
app.use(categorias)
app.use(produtos)
app.use(mesas)