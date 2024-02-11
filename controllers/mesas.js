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

//carrega total da mesa para cliente e cozinha
mesas.get("/total/:id_mesa/:token", function (req, res) {

    verificaJWT(req.params.token, function (erro, token_validado) {
        
        if (erro) {

            res.send({
                codigo: 400,
                message: erro.message
            })
        }
        else if (token_validado.data == "newLoginCliente" || token_validado.data == "newLoginCasa") {

            database.query(`
            select sum(pd.total) from public.pedido_detalhe pd
            JOIN public.pedido_cabecalho pc on pc.id_pedido = pd.id_pedido
            where pc.mesa = ${req.params.id_mesa} and limpou_mesa = 0
            `, function (erro, total) {

                if (erro) {

                    res.send({
                        codigo: 400,
                        message: erro.message
                    })
                }
                else {

                    res.send({
                        codigo: 200,
                        total: total.rows
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

//limpa mesa - cozinha
mesas.put('/limpa/mesa/:id_mesa/:token', function (req, res) {

    verificaJWT(req.params.token, function (erro, token_validado) {

        if (erro) {

            res.send({
                codigo: 400,
                message: erro.message
            })
        }
        else if (token_validado.data == "newLoginCasa") {

            database.query(`
            update public.pedido_cabecalho set limpou_mesa = 1 where mesa = ${req.params.id_mesa}
            `, function (erro) {

                if (erro) {

                    res.send({
                        codigo: 400,
                        message: erro.message
                    })
                }
                else {

                    res.send({
                        codigo: 200,
                        message: "Sucesso ao limpar mesa"
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

//carrega historico da mesa
mesas.get("/load/mesa/pedidos/:token/:id_mesa", function (req, res) {

    verificaJWT(req.params.token, function (erro, token_validado) {

        if (erro) {

            res.send({
                codigo: 400,
                message: erro.message
            })
        }
        else if (token_validado.data == "newLoginCasa") {

            database.query(`
            select pc.*, sum(pd.total) from public.pedido_cabecalho pc 
            JOIN public.pedido_detalhe pd on pd.id_pedido = pc.id_pedido
            where pc.mesa = ${req.params.id_mesa} and limpou_mesa = 1
            group by pc.id_pedido, pc.mesa, pc.status, pc.cliente, pc.limpou_mesa
            `, function (erro, pedidos) {

                if (erro) {

                    res.send({
                        codigo: 400,
                        message: erro.message
                    })
                }
                else {

                    res.send({
                        codigo: 200,
                        pedidos: pedidos.rows
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

//carrega pedidos da mesa concluidos para levar na mesa
mesas.get("/carregar/mesa/pedidosConcluidos/:token/:id_mesa", function (req, res) {

    verificaJWT(req.params.token, function (erro, token_validado) {

        if (erro) {

            res.send({
                codigo: 400,
                message: erro.message
            })
        }
        else if (token_validado.data == "newLoginCasa") {

            database.query(`
            select pc.*, sum(pd.total) from public.pedido_cabecalho pc 
            JOIN public.pedido_detalhe pd on pd.id_pedido = pc.id_pedido
            where pc.mesa = ${req.params.id_mesa} and limpou_mesa = 0
            group by pc.id_pedido, pc.mesa, pc.status, pc.cliente, pc.limpou_mesa
            `, function (erro, pedidos) {

                if (erro) {

                    res.send({
                        codigo: 400,
                        message: erro.message
                    })
                }
                else {

                    res.send({
                        codigo: 200,
                        pedidos: pedidos.rows
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

