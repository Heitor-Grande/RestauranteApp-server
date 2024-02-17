const express = require("express")
const criarJWT = express()
const {gerarJWT, verificaJWT} = require("../functions/jwt")
const VerificatokenAcesso = require("../functions/verificaTokenAcesso")

//cria token para cliente
criarJWT.get("/criar/jwt/:token_acesso", VerificatokenAcesso, function(req, res){

    gerarJWT("newLoginCliente", function(erro, token){
        
        if(erro){

            res.send({
                message: erro.messa,
                codigo: 400
            })
        }
        else if(token){

            const dados ={
                token: token,
                id_cliente: req.id_cliente
            }

            res.send({
                token: dados,
                codigo: 200
            })
        }
    })
})

//cria token para garçons, etc
criarJWT.get("/criar/jwt/casa/:token_acesso", VerificatokenAcesso, function(req, res){

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


criarJWT.get("/validar/token/:token/:token_acesso", VerificatokenAcesso, function(req, res){
    
    verificaJWT(req.params.token, function(erro, token_validado){
        if(erro){

            res.send({
                codigo: 400,
                message: "Token inválido, leia novamente o QRCode"
            })
        }
        else if(token_validado){

            const dados = {
                id_cliente: req.id_cliente,
                token_validado: token_validado.data
            }
            res.send({
                codigo: 200,
                infoToken: dados
            })
        }
    })
})

module.exports = criarJWT