const express = require("express")
const mesas = express.Router()
const { verificaJWT } = require("../functions/jwt")
const database = require("../database/dbConnection")

mesas.post("/criar/mesa/:tokenJWT/:id_cliente", function (req, res) {

    verificaJWT(req.params.tokenJWT, function (erro, token_validado) {
        if (erro) {

            res.send({
                codigo: 400,
                message: erro.message
            })
        }
        else if (token_validado.data == "newLoginCasa") {

            database.query(`select num_mesa from public.mesas where id_cliente = ${req.params.id_cliente}`,
                function (erro, resposta) {

                    if (erro) {

                        res.send({
                            message: erro.message,
                            codigo: 400
                        })
                    }
                    else {
                        
                        database.query(`
            insert into public.mesas (total, status, chamado, id_cliente, num_mesa)
            values('0', 'true', 'false', ${req.params.id_cliente}, ${resposta.rows[0] ? resposta.rows[0].num_mesa + 1 : 1})
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

mesas.get("/selecionar/mesas/:tokenJWT/:id_cliente", function (req, res) {

    verificaJWT(req.params.tokenJWT, function (erro, token_validado) {

        if (erro) {

            res.send({
                codigo: 400,
                message: erro.message
            })
        }
        else if (token_validado.data == "newLoginCasa") {

            database.query(`
                select * from public.mesas where id_cliente = ${req.params.id_cliente} order by id_mesa asc
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

mesas.get("/selecionar/mesa/:tokenJWT/:id_mesa/:id_cliente", function (req, res) {

    verificaJWT(req.params.tokenJWT, function (erro, token_validado) {

        if (erro) {

            res.send({
                codigo: 400,
                message: erro.message
            })
        }
        else if (token_validado.data == "newLoginCasa") {

            database.query(`
                select * from public.mesas where id_mesa = ${req.params.id_mesa} and id_cliente = ${req.params.id_cliente} order by id_mesa asc 
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

mesas.put("/alterar/status/:tokenJWT/:id_mesa/:id_cliente", function (req, res) {

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
               update mesas set status = '${status}' where id_mesa = ${req.params.id_mesa} and id_cliente = ${req.params.id_cliente}
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
mesas.get("/total/:id_mesa/:token/:id_cliente", function (req, res) {

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
            where pc.mesa = ${req.params.id_mesa} and limpou_mesa = 0 and pd.id_cliente = ${req.params.id_cliente} and pc.status = 'CONCLUIDO'
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
mesas.put('/limpa/mesa/:id_mesa/:token/:id_cliente', function (req, res) {

    verificaJWT(req.params.token, function (erro, token_validado) {

        if (erro) {

            res.send({
                codigo: 400,
                message: erro.message
            })
        }
        else if (token_validado.data == "newLoginCasa") {

            database.query(`
            update public.pedido_cabecalho set limpou_mesa = 1 where mesa = ${req.params.id_mesa} and id_cliente = ${req.params.id_cliente}
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
mesas.get("/load/mesa/pedidos/:token/:id_mesa/:id_cliente", function (req, res) {

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
            where pc.mesa = ${req.params.id_mesa} and limpou_mesa = 1 and pd.id_cliente = ${req.params.id_cliente}
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
mesas.get("/carregar/mesa/pedidosConcluidos/:token/:id_mesa/:id_cliente", function (req, res) {

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
            where pc.mesa = ${req.params.id_mesa} and limpou_mesa = 0 and pc.id_cliente = ${req.params.id_cliente}
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

//verifica se mesa está aberta para cliente entrar usando qrcode
mesas.get("/validar/mesa/:num_mesa/:id_cliente", function (req, res) {

    database.query(`select * from mesas where num_mesa = ${req.params.num_mesa} and id_cliente = ${req.params.id_cliente}`, function (erro, mesa) {

        if (erro) {

            res.send({
                message: erro.message,
                codigo: 400
            })
        }
        else if (mesa.rows[0].status == true) {

            res.send({
                mesa: mesa.rows,
                codigo: 200
            })
        }
        else {

            res.send({
                message: "Mesa fechada, chame um garçom.",
                codigo: 400
            })
        }
    })
})

mesas.put("/chamado/:status_chamado/:token/:id_mesa/:id_cliente", function (req, res) {

    verificaJWT(req.params.token, function (erro, token_validado) {

        if (erro) {

            res.send({
                codigo: 400,
                message: erro.message
            })
        }
        else if (token_validado.data == "newLoginCasa" || token_validado.data == "newLoginCliente") {

            database.query(`
            update public.mesas set chamado = '${req.params.status_chamado}' where id_mesa = ${req.params.id_mesa} and id_cliente = ${req.params.id_cliente}
            `, function (erro) {

                if (erro) {

                    res.send({
                        codigo: 400,
                        message: erro.message
                    })
                }
                else {

                    if (req.params.status_chamado == "false") {

                        res.send({
                            codigo: 200,
                            message: "Chamado atendido"
                        })
                    }
                    else {

                        res.send({
                            codigo: 200,
                            message: "Chamado solicitado"
                        })
                    }

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

