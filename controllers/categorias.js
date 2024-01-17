const express = require("express")
const categorias = express.Router()
const { verificaJWT } = require("../functions/jwt")
const database = require("../database/dbConnection")

categorias.post("/criar/categoria/:tokenJWT", function (req, res) {

    verificaJWT(req.params.tokenJWT, function (erro, token_validado) {
        if (erro) {

            res.send({
                codigo: 400,
                message: erro.message
            })
        }
        else if (token_validado.data == "newLoginCasa") {

            database.query(`
            insert into public.categorias (categoria, ativo)
            values('${req.body.categoria}', '${req.body.ativo}')
            `, function (erro) {
                if (erro) {

                    res.send({
                        message: erro.message,
                        codigo: 400
                    })
                }
                else {

                    res.send({
                        message: "Categoria criada com sucesso.",
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

categorias.get("/all/categorias/:token", function (req, res) {

    verificaJWT(req.params.token, function (erro, token_valido) {

        if (erro) {
            res.send({
                codigo: 400,
                message: "Erro ao validar token para carregar categorias"
            })
        }
        else if (token_valido.data == "newLoginCasa") {

            database.query(`
                select * from public.categorias
            `, function (erro, categorias) {
                if (erro) {
                    res.send({
                        message: erro.message,
                        codigo: 400
                    })
                }
                else {
                    res.send({
                        codigo: 200,
                        categorias: categorias.rows
                    })
                }
            })
        }
        else {
            res.send({
                message: "Token Inválido para carregar categorias",
                codigo: 400
            })
        }
    })
})

categorias.get("/categoriaid/categorias/:token/:id_categoria", function (req, res) {

    verificaJWT(req.params.token, function (erro, token_valido) {

        if (erro) {
            res.send({
                codigo: 400,
                message: "Erro ao validar token para carregar categorias"
            })
        }
        else if (token_valido.data == "newLoginCasa") {

            database.query(`
                select * from public.categorias where id_categoria = ${req.params.id_categoria}
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
                message: "Token Inválido para carregar categorias",
                codigo: 400
            })
        }
    })
})

categorias.put("/editar/categoria/:tokenJWT", function (req, res) {

    verificaJWT(req.params.tokenJWT, function (erro, token_validado) {
        if (erro) {

            res.send({
                codigo: 400,
                message: erro.message
            })
        }
        else if (token_validado.data == "newLoginCasa") {

            database.query(`
             UPDATE public.categorias 
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

categorias.delete("/del/categoria/:token/:id_categoria", function (req, res) {

    verificaJWT(req.params.token, function (erro, token_validado) {
        if (erro) {

            res.send({
                codigo: 400,
                message: erro.message
            })
        }
        else if (token_validado.data == "newLoginCasa") {

            database.query(`
            DELETE from public.categorias 
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

module.exports = categorias