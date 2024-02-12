const express = require("express")
const produtos = express.Router()
const { verificaJWT } = require("../functions/jwt")
const database = require("../database/dbConnection")

produtos.post("/criar/produto/:tokenJWT", function (req, res) {

    verificaJWT(req.params.tokenJWT, function (erro, token_validado) {
        if (erro) {

            res.send({
                codigo: 400,
                message: erro.message
            })
        }
        else if (token_validado.data == "newLoginCasa") {

            const {
                nome,
                status,
                preco,
                descricao,
                img,
                id_categoria
            } = req.body

            database.query(`
            insert into public.produtos (nome, preco, descricao, status, img, id_categoria)
            values('${nome}', '${preco}', '${descricao}', '${status}', '${img}', ${id_categoria})
            `, function (erro) {
                if (erro) {

                    res.send({
                        message: erro.message,
                        codigo: 400
                    })
                }
                else {

                    res.send({
                        message: "Produto criado com sucesso.",
                        codigo: 200
                    })
                }
            })
        }
        else {

            res.send({
                message: "Token inválido",
                codigo: 400
            })
        }
    })
})

produtos.get("/all/produtos/:token", function (req, res) {

    verificaJWT(req.params.token, function (erro, token_valido) {

        if (erro) {

            res.send({
                codigo: 400,
                message: "Erro ao validar token para carregar produtos"
            })
        }
        else if (token_valido.data == "newLoginCasa") {

            database.query(`
                select * from public.produtos
            `, function (erro, produtos) {
                if (erro) {

                    res.send({
                        message: erro.message,
                        codigo: 400
                    })
                }
                else {

                    res.send({
                        codigo: 200,
                        produtos: produtos.rows
                    })
                }
            })
        }
        else {
            res.send({
                message: "Token Inválido para carregar produtos",
                codigo: 400
            })
        }
    })
})

produtos.get("/produtoid/produtos/:token/:id_produto", function (req, res) {

    verificaJWT(req.params.token, function (erro, token_valido) {

        if (erro) {
            res.send({
                codigo: 400,
                message: "Erro ao validar token para carregar produtos"
            })
        }
        else if (token_valido.data == "newLoginCasa" || token_valido.data == "newLoginCliente") {

            database.query(`
                select * from public.produtos where id_produto = ${req.params.id_produto}
            `, function (erro, produto) {
                if (erro) {

                    res.send({
                        message: erro.message,
                        codigo: 400
                    })
                }
                else {

                    res.send({
                        codigo: 200,
                        produto: produto.rows
                    })
                }
            })
        }
        else {
            res.send({
                message: "Token Inválido para carregar produtos",
                codigo: 400
            })
        }
    })
})

produtos.put("/editar/produto/:tokenJWT", function (req, res) {

    verificaJWT(req.params.tokenJWT, function (erro, token_validado) {
        if (erro) {

            res.send({
                codigo: 400,
                message: erro.message
            })
        }
        else if (token_validado.data == "newLoginCasa") {

            const {
                id_produto,
                nome,
                status,
                preco,
                descricao,
                img,
                id_categoria
            } = req.body

            database.query(`
            UPDATE public.produtos
            SET preco='${preco}', status='${status}', img='${img}', nome='${nome}', descricao='${descricao}', id_categoria=${id_categoria}
            WHERE id_produto = ${id_produto}
            `, function (erro) {
                if (erro) {

                    res.send({
                        message: erro.message,
                        codigo: 400
                    });
                } else {

                    res.send({
                        message: "Produto atualizado com sucesso.",
                        codigo: 200
                    })
                }
            })
        }
        else {

            res.send({
                message: "Token inválido",
                codigo: 400
            })
        }
    })
})

produtos.delete("/del/produto/:token/:id_produto", function (req, res) {

    verificaJWT(req.params.token, function (erro, token_validado) {
        if (erro) {

            res.send({
                codigo: 400,
                message: erro.message
            })
        }
        else if (token_validado.data == "newLoginCasa") {

            database.query(`
            DELETE from public.produtos 
            WHERE
            id_produto = ${req.params.id_produto}
            `, function (erro) {
                if (erro) {

                    res.send({
                        message: erro.message,
                        codigo: 400
                    });
                } else {

                    res.send({
                        message: "Produto deletado com sucesso.",
                        codigo: 200
                    })
                }
            })
        }
        else {

            res.send({
                message: "Token inválido",
                codigo: 400
            })
        }
    })
})

produtos.get("/carrega/produtos/by/categoria/:token/:id_categoria", function(req, res){

    verificaJWT(req.params.token, function(erro, token_validado){

        if(erro){

            res.send({
                codigo: 400,
                message: erro.message
            })
        }
        else if(token_validado.data == "newLoginCasa" || token_validado.data == "newLoginCliente"){

            database.query(`
                select * from public.produtos where status = 'true' and id_categoria = ${req.params.id_categoria}
            `, function(erro, produtos){

                if(erro){

                    res.send({
                        codigo: 400,
                        message: erro.message
                    })
                }
                else{

                    res.send({
                        codigo: 200,
                        produtos: produtos.rows
                    })
                }
            })

        }
        else{
            
            res.send({
                codigo:400,
                message: "Token inválido, leia novamente o QR code."
            })
        }
    })
})

module.exports = produtos