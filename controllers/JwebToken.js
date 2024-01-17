const express = require("express")
const criarJWT = express()
const {gerarJWT, verificaJWT} = require("../functions/jwt")

//cria token para cliente
criarJWT.get("/criar/jwt", function(req, res){

    gerarJWT("newLoginCliente", function(erro, token){
        
        if(erro){

            res.send({
                message: erro.messa,
                codigo: 400
            })
        }
        else if(token){

            res.send({
                token: token,
                codigo: 200
            })
        }
    })
})

//cria token para garçons, etc
criarJWT.get("/criar/jwt/casa", function(req, res){

    gerarJWT("newLoginCasa", function(erro, token){
        
        if(erro){

            res.send({
                message: erro.messa,
                codigo: 400
            })
        }
        else if(token){

            res.send({
                token: token,
                codigo: 200
            })
        }
    })
})

criarJWT.get("/validar/token/:token", function(req, res){
    
    verificaJWT(req.params.token, function(erro, token_validado){
        if(erro){

            res.send({
                codigo: 400,
                message: "Token inválido, leia novamente o QRCode"
            })
        }
        else if(token_validado){

            res.send({
                codigo: 200,
                infoToken: token_validado.data
            })
        }
    })
})

module.exports = criarJWT