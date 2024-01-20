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
                img
            } = req.body

            database.query(`
            insert into public.produtos (nome, preco, descricao, status, img)
            values('${nome}', '${preco}', '${descricao}', '${status}', '${img}')
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

produtos.get("/categoriaid/produtos/:token/:id_categoria", function (req, res) {

    verificaJWT(req.params.token, function (erro, token_valido) {

        if (erro) {
            res.send({
                codigo: 400,
                message: "Erro ao validar token para carregar produtos"
            })
        }
        else if (token_valido.data == "newLoginCasa") {

            database.query(`
                select * from public.produtos where id_categoria = ${req.params.id_categoria}
            `, function (erro, categoria) {
                if (erro) {
                    res.send({
                        message: erro.message,
                        codigo: 400
                    })
                }
                else {
                    res.send({
                        codigo: 200,
                        categoria: categoria.rows
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

produtos.put("/editar/categoria/:tokenJWT", function (req, res) {

    verificaJWT(req.params.tokenJWT, function (erro, token_validado) {
        if (erro) {

            res.send({
                codigo: 400,
                message: erro.message
            })
        }
        else if (token_validado.data == "newLoginCasa") {

            database.query(`
             UPDATE public.produtos 
                SET 
            categoria = '${req.body.categoria}', 
            ativo = '${req.body.ativo}'
            WHERE
            id_categoria = ${req.body.id_categoria}
            `, function (erro) {
                if (erro) {

                    res.send({
                        message: erro.message,
                        codigo: 400
                    });
                } else {

                    res.send({
                        message: "Categoria atualizada com sucesso.",
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

produtos.delete("/del/categoria/:token/:id_categoria", function (req, res) {

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
            id_categoria = ${req.params.id_categoria}
            `, function (erro) {
                if (erro) {

                    res.send({
                        message: erro.message,
                        codigo: 400
                    });
                } else {

                    res.send({
                        message: "Categoria deletada com sucesso.",
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

module.exports = produtos