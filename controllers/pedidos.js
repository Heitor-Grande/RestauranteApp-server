const express = require("express")
const { verificaJWT } = require("../functions/jwt")
const database = require("../database/dbConnection")
const pedidos = express.Router()

//cria pedio cabecalho e/ou pedido detalhe
pedidos.post("/criar/pedido/:id_mesa/:token/:id_produto", function (req, res) {

    verificaJWT(req.params.token, function (erro, token_decodificado) {

        if (erro) {

            res.send({
                codigo: 400,
                message: "Erro ao validar token: " + erro.message
            })
        }
        else if (token_decodificado.data == "newLoginCliente") {

            database.query(`
                select * from public.pedido_cabecalho where mesa = ${req.params.id_mesa} and cliente = '${req.body.cliente}'
            `, function (erro, pedido) {

                if (erro) {

                    res.send({
                        message: erro.message,
                        codigo: 400
                    })
                }
                else if (pedido.rows.length == 1) {
                    //ja existe um cabecalho, preciso adicionar um pedido detalhe

                    database.query(`
                        select * from public.produtos where id_produto = ${req.params.id_produto}
                    `, function (erro, produto) {

                        if (erro) {

                            res.send({
                                codigo: 400,
                                message: erro.message
                            })
                        }
                        else {

                            const total = produto.rows[0].preco * req.body.qtde
                            database.query(`
                                    INSERT INTO public.pedido_detalhe
                                    (id_pedido, produto, qtd, valor_und, total)
                                    VALUES(${pedido.rows[0].id_pedido}, '${produto.rows[0].nome}', ${req.body.qtde}, ${produto.rows[0].preco}, ${total})
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
                                        message: "Adicionado ao pedido com sucesso"
                                    })
                                }
                            })
                        }
                    })
                }
                else {
                    //preciso criar o cabecalho e o pedido detalhe
                    database.query(`
                    INSERT INTO public.pedido_cabecalho
                    (mesa, total_pedido, status, cliente, limpou_mesa)
                    VALUES(${req.params.id_mesa}, 0, 'MONTANDO', '${req.body.cliente}', 0) RETURNING *
                    `, function (erro, insert) {

                        if (erro) {

                            res.send({
                                codigo: 400,
                                message: erro.message
                            })
                        }
                        else {


                            database.query(`
                            SELECT *
                            FROM public.produtos where id_produto = ${req.params.id_produto}
                            `, function (erro, produto) {

                                if (erro) {

                                    res.send({
                                        codigo: 400,
                                        message: erro.message
                                    })
                                }
                                else {

                                    const total = produto.rows[0].preco * req.body.qtde

                                    database.query(`
                                    INSERT INTO public.pedido_detalhe
                                    (id_pedido, produto, qtd, valor_und, total)
                                    VALUES(${insert.rows[0].id_pedido}, '${produto.rows[0].nome}', ${req.body.qtde}, ${produto.rows[0].preco}, ${total})
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
                                                message: "Adicionado ao pedido com sucesso"
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }
        else {

            res.send({
                message: "Token Inválido para pedir",
                codigo: 400
            })
        }
    })
})

//carrega o cabecalho d pedido
pedidos.get("/carregar/pedidos/:id_mesa/:token", function (req, res) {

    verificaJWT(req.params.token, function (erro, token_decodificado) {

        if (erro) {

            res.send({
                message: erro.message,
                codigo: 400
            })
        }
        else if (token_decodificado.data == "newLoginCliente") {

            database.query(`
                select pc.* from public.pedido_cabecalho pc 
                where pc.mesa = ${req.params.id_mesa} and pc.limpou_mesa = 0
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
                message: "Token para pedir inválido",
                codigo: 400
            })
        }
    })
})

//carrega detalhes do pedido
pedidos.get("/carregar/detalhes/:id_pedido/:token", function (req, res) {

    verificaJWT(req.params.token, function (erro, token_decodificado) {

        if (erro) {

            res.send({
                message: erro.message,
                codigo: 400
            })
        }
        else if (token_decodificado.data == "newLoginCliente") {

            database.query(`
                select * from public.pedido_detalhe pc 
                where id_pedido  = ${req.params.id_pedido}
            `, function (erro, detalhes) {

                if (erro) {

                    res.send({
                        codigo: 400,
                        message: erro.message
                    })
                }
                else {

                    res.send({
                        codigo: 200,
                        detalhes: detalhes.rows
                    })
                }
            })
        }
        else {

            res.send({
                message: "Token para pedir inválido",
                codigo: 400
            })
        }
    })
})

//deleta pedido detalhe
pedidos.get("/deleta/detalhe/:id_pedido_detalhe/:token", function (req, res) {

    verificaJWT(req.params.token, function (erro, token_decodificado) {

        if (erro) {

            res.send({
                message: erro.message,
                codigo: 400
            })
        }
        else if (token_decodificado.data == "newLoginCliente") {


            database.query(`
                select pc.* from public.pedido_cabecalho pc
                JOIN pedido_detalhe pd on pd.id_pedido_detalhe = ${req.params.id_pedido_detalhe}
                where pc.id_pedido = pd.id_pedido
            `, function (erro, pedido) {

                if (erro) {

                    res.send({
                        message: erro,
                        codigo: 400
                    })
                }
                else if (pedido.rows[0].status == 'MONTANDO') {

                    database.query(`
                    delete from public.pedido_detalhe
                    where id_pedido_detalhe = ${req.params.id_pedido_detalhe}
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
                                message: "Retirado do pedido."
                            })
                        }
                    })
                }
                else {

                    res.send({
                        message: "Pedido já enviado para cozinha, chame um garçom.",
                        codigo: 400
                    })
                }
            })
        }
        else {

            res.send({
                message: "Token para pedir inválido",
                codigo: 400
            })
        }
    })
})

//envia pedido para cozinha MONTANDO > "PENDENTE"
pedidos.put("/atualizar/status/:id_pedido/:token/:mesa", function (req, res) {

    verificaJWT(req.params.token, function (erro, token_decodificado) {

        if (erro) {

            res.send({
                codigo: 400,
                message: erro.message
            })
        }
        else if (token_decodificado.data == "newLoginCliente") {

            database.query(`
            update public.pedido_cabecalho set status = 'PENDENTE'
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
                        message: "Pedido enviado para cozinha"
                    })
                }
            })
        }
        else {

            res.send({
                message: "Token para pedir inválido",
                codigo: 400
            })
        }
    })
})
module.exports = pedidos