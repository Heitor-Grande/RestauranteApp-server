const express = require("express")
const mesas = express.Router()
const { verificaJWT } = require("../functions/jwt")
const database = require("../database/dbConnection")

mesas.post("/criar/mesa/:tokenJWT", function (req, res) {

    verificaJWT(req.params.tokenJWT, function (erro, token_validado) {
        if (erro) {

            res.send({
                codigo: 400,
                message: erro.message
            })
        }
        else if (token_validado.data == "newLoginCasa") {

            database.query(`
            insert into public.mesas (total, status)
            values('0', 'true')
            `, function (erro) {
                if (erro) {

                    res.send({
                        message: erro.message,
                        codigo: 400
                    })
                }
                else {

                    res.send({
                        message: "Mesa criada com sucesso.",
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

mesas.get("/selecionar/mesas/:tokenJWT", function (req, res) {

    verificaJWT(req.params.tokenJWT, function (erro, token_validado) {

        if (erro) {

            res.send({
                codigo: 400,
                message: erro.message
            })
        }
        else if (token_validado.data == "newLoginCasa") {

            database.query(`
                select * from public.mesas order by id_mesa asc
            `, function (erro, mesas) {
                if (erro) {

                    res.send({
                        message: erro.message,
                        codigo: 400
                    })
                }
                else {

                    res.send({
                        mesas: mesas.rows,
                        codigo: 200
                    })
                }
            })
        }
        else {

            res.send({
                codigo: 400,
                message: "Token inválido"
            })
        }
    })
})

mesas.get("/selecionar/mesa/:tokenJWT/:id_mesa", function (req, res) {

    verificaJWT(req.params.tokenJWT, function (erro, token_validado) {

        if (erro) {

            res.send({
                codigo: 400,
                message: erro.message
            })
        }
        else if (token_validado.data == "newLoginCasa") {

            database.query(`
                select * from public.mesas where id_mesa = ${req.params.id_mesa} order by id_mesa asc 
            `, function (erro, mesas) {
                if (erro) {

                    res.send({
                        message: erro.message,
                        codigo: 400
                    })
                }
                else {

                    res.send({
                        mesa: mesas.rows,
                        codigo: 200
                    })
                }
            })
        }
        else {

            res.send({
                codigo: 400,
                message: "Token inválido"
            })
        }
    })
})

mesas.put("/alterar/status/:tokenJWT/:id_mesa", function (req, res) {

    verificaJWT(req.params.tokenJWT, function (erro, token_validado) {

        if (erro) {

            res.send({
                codigo: 400,
                message: erro.message
            })
        }
        else if (token_validado.data == "newLoginCasa") {

            const status = req.body.status

            database.query(`
               update mesas set status = '${status}' where id_mesa = ${req.params.id_mesa}
            `, function (erro) {
                if (erro) {

                    res.send({
                        message: erro.message,
                        codigo: 400
                    })
                }
                else {

                    res.send({
                        message: "Status da mesa atualizado.",
                        codigo: 200
                    })
                }
            })
        }
        else {

            res.send({
                codigo: 400,
                message: "Token inválido"
            })
        }
    })
})

module.exports = mesas

