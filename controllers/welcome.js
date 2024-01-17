const express = require("express")
const welcome = express.Router()


welcome.get("/", function(req, res){
    res.send({
        message: "Bem vindo à api GSD"
    })
})


module.exports = welcome