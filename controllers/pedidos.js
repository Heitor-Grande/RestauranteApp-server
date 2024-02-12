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
                select * from public.pedido_cabecalho where mesa = ${req.params.id_mesa} and cliente = '${req.body.cliente}' and limpou_mesa = 0
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
                                    (id_pedido, produto, qtd, valor_und, total, obs)
                                    VALUES(${pedido.rows[0].id_pedido}, '${produto.rows[0].nome}', ${req.body.qtde}, ${produto.rows[0].preco}, ${total}, '${req.body.obs}')
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
                    (mesa, status, cliente, limpou_mesa)
                    VALUES(${req.params.id_mesa}, 'MONTANDO', '${req.body.cliente}', 0) RETURNING *
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
                                    (id_pedido, produto, qtd, valor_und, total, obs)
                                    VALUES(${insert.rows[0].id_pedido}, '${produto.rows[0].nome}', ${req.body.qtde}, ${produto.rows[0].preco}, ${total}, '${req.body.obs}')
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
            SELECT pc.id_pedido, pc.mesa, pc.limpou_mesa, pc.cliente, pc.status, SUM(pd.total) AS soma_pedido 
            FROM public.pedido_cabecalho pc 
            JOIN public.pedido_detalhe pd ON pd.id_pedido = pc.id_pedido 
            WHERE pc.mesa = ${req.params.id_mesa} AND pc.limpou_mesa = 0
            GROUP BY pc.id_pedido, pc.mesa, pc.limpou_mesa
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

//carrega detalhes do pedido cliente e cozinha
pedidos.get("/carregar/detalhes/:id_pedido/:token", function (req, res) {

    verificaJWT(req.params.token, function (erro, token_decodificado) {

        if (erro) {

            res.send({
                message: erro.message,
                codigo: 400
            })
        }
        else if (token_decodificado.data == "newLoginCliente" || token_decodificado.data == "newLoginCasa") {

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

            //verifico se status é MONTANADO para poder deletar
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
                            //verifico se pedido detalhe ficou == 0 para deletar cabecalho
                            database.query(`
                            select pd.* from public.pedido_cabecalho pc
                            JOIN pedido_detalhe pd on pd.id_pedido = ${pedido.rows[0].id_pedido}
                            where pc.id_pedido = pd.id_pedido
                            `, function (erro, pedidos_detalhes) {

                                if (erro) {

                                    res.send({
                                        codigo: 400,
                                        message: erro.message
                                    })
                                }
                                else if (pedidos_detalhes.rows.length == 0) {

                                    database.query(`
                                    delete from public.pedido_cabecalho where id_pedido = ${pedido.rows[0].id_pedido}
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
                                                message: "Pedido cancelado."
                                            })
                                        }
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

//carrega pedidos com status X - apenas para cozinha
pedidos.get("/all/pedidos/pendentes/:token/:status", function (req, res) {

    verificaJWT(req.params.token, function (erro, token_decodificado) {

        if (erro) {

            res.send({
                codigo: 400,
                message: erro.message
            })
        }
        else if (token_decodificado.data == "newLoginCasa") {
            database.query(`
            select * from public.pedido_cabecalho
            where status like '${req.params.status}' and limpou_mesa = 0
            `, function (erro, pedidos_pendentes) {
                if (erro) {

                    res.send({
                        codigo: 400,
                        message: erro.message
                    })
                }
                else {

                    res.send({
                        codigo: 200,
                        pedidos: pedidos_pendentes.rows
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

//atualiza status de pedidos
pedidos.put("/att/pedidos/stt/:token/:status/:id_pedido", function (req, res) {

    verificaJWT(req.params.token, function (erro, token_decodificado) {

        if (erro) {

            res.send({
                codigo: 400,
                message: erro.message
            })
        }
        else if (token_decodificado.data == "newLoginCasa") {

            database.query(`
            update public.pedido_cabecalho
            set status = '${req.params.status}'
            where id_pedido = ${req.params.id_pedido}
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
                        message: `Pedido atualizado para: ${req.params.status}`
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

module.exports = pedidos