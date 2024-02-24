const express = require("express")
const integracoes = express.Router()
const database = require("../database/dbConnection")
const { criptografar } = require("../functions/crypto")
const VerificatokenAcesso = require("../functions/verificaTokenAcesso")

//cadastra novo cliente e gera token_acesso
integracoes.post("/add/cliente/:cnpj_filial", function (req, res) {

    database.query(`
        select * from public.filial where cnpj = '${req.params.cnpj_filial}'
    `, function (erro, filial) {

        if (erro) {

            res.send({
                codigo: 400,
                message: erro.message
            })
        }
        else if (filial.rows.length == 1) {

            if (filial.rows[0].bloqueio == true) {

                res.send({
                    message: "Filial bloqueada",
                    codigo: 400
                })
            }
            else {

                const { cnpj, fantasia } = req.body

                if (cnpj != "" && fantasia != "") {

                    const token_acesso = criptografar(cnpj + "-" + fantasia)
                    database.query(`
                    INSERT INTO public.clientes_filial
                    (fantasia, cnpj, filial, bloqueio, motivo_bloqueio, token_acesso)
                    VALUES('${fantasia}', '${cnpj}', ${filial.rows[0].id_filial}, false, '', '${cnpj + "-" + fantasia}')
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
                                message: "Cliente criado com sucesso e vinculado à filial.",
                                link: `${process.env.REACT_APP_LINKQR}/entrar/criar/token/casa/${token_acesso.replace(/\//g, "-")}`,
                                token: token_acesso.replace(/\//g, "-")
                            })
                        }
                    })
                }
            }
        }
        else if (filial.rows.length > 1) {

            res.send({
                message: `Mais de uma filial encontrada para o mesmo CNPJ: ${req.params.cnpj_filial}`,
                codigo: 400
            })
        }
        else {

            res.send({
                message: "Nenhuma Filial encontrada",
                codigo: 400
            })
        }
    })
})

//consulta link de acesso à cozinha
integracoes.get("/consultar/acesso/:cnpj_filial/:cnpj_cliente", function (req, res) {

    database.query(`
        select c.* from public.filial f
        JOIN public.clientes_filial c on c.filial = f.id_filial
        where f.cnpj = '${req.params.cnpj_filial}' and c.cnpj = '${req.params.cnpj_cliente}'
    `, function (erro, cliente) {

        if (erro) {

            res.send({
                message: erro.message,
                codigo: 400
            })
        }
        else if (cliente.rows.length == 1) {

            const token_acesso = criptografar(cliente.rows[0].token_acesso)

            res.send({
                codigo: 200,
                message: "Link de acesso à cozinha gerado com sucesso.",
                link: `${process.env.REACT_APP_LINKQR}/entrar/criar/token/casa/${token_acesso.replace(/\//g, "-")}`,
                token: token_acesso.replace(/\//g, "-")
            })
        }
        else if (cliente.rows.length > 1) {

            res.send({
                message: "Mais de um cliente da filial encontrado para o mesmo CNPJ",
                codigo: 400
            })
        }
        else if (cliente.rows.length == 0) {

            res.send({
                codigo: 400,
                message: `Nenhum cliente da filial encontrado de CNPJ: ${req.params.cnpj_cliente}`,
                cliente: cliente.rows
            })
        }
        else {

            res.send({
                message: "Erro desconhecido",
                codigo: 400
            })
        }
    })
})

//rota para inserir produtos pdv do cliente 
integracoes.post('/sinc/prod/:cnpj_filial/:cnpj_cliente/:token_acesso', VerificatokenAcesso, function (req, res) {

    database.query(`
    select f.cnpj as cnpj_filial, f.bloqueio as bloqueio_filial, c.id_cliente, c.cnpj from public.filial f
    JOIN public.clientes_filial c on c.filial = f.id_filial
    where f.cnpj = '${req.params.cnpj_filial}' and c.cnpj = '${req.params.cnpj_cliente}'
    `, function (erro, filial_cliente) {

        if (erro) {

            res.send({
                codigo: 400,
                message: erro.message
            })
        }
        else if (filial_cliente.rows.length == 1) {

            if (filial_cliente.rows[0].bloqueio_filial == true) {

                res.send({
                    codigo: 400,
                    message: `Não é possível sincronizar produtos, motivo: Filial bloqueada.`
                })
            }
            else if (filial_cliente.rows[0].bloqueio == true) {

                res.send({
                    codigo: 400,
                    message: `Não é possível sincronizar produtos, motivo: Cliente bloqueado.`
                })
            }
            else {

                const lista = req.body.lista
                let respostaEnviada = false
                for (let i = 0; i < lista.length; i = i + 1) {

                    database.query(`select * from public.produtos where cod_pdv = '${lista[i].cod_pdv}' and id_cliente = ${filial_cliente.rows[0].id_cliente}`, function (erro, produto) {

                        if (erro && respostaEnviada == false) {

                            respostaEnviada = true
                            res.send({
                                codigo: 400,
                                message: `Erro ao procurar produto: ${erro.message}`
                            })
                        }
                        else if (produto.rows.length == 1) {
                            //faz update
                            database.query(`
                            UPDATE public.produtos
                            SET preco='${lista[i].preco}', 
                            status='${lista[i].status}', img='${lista[i].img}',
                            nome='${lista[i].nome}', descricao='${lista[i].descricao}', 
                            id_categoria=${produto.rows[0].id_categoria}, cod_pdv = '${lista[i].cod_pdv}'
                            WHERE cod_pdv = '${lista[i].cod_pdv}' and id_cliente = ${filial_cliente.rows[0].id_cliente}
                            `, function (erro) {

                                if (erro && respostaEnviada == false) {

                                    respostaEnviada = true
                                    res.send({
                                        codigo: 400,
                                        message: `Erro ao sincronizar produtos: ${erro.message}`
                                    })
                                }
                                else if (respostaEnviada == false && (lista.length - 1) == i) {

                                    respostaEnviada = true
                                    res.send({
                                        codigo: 200,
                                        message: "Produtos sincronizados com sucesso"
                                    })
                                }
                            })
                        }
                        else if (produto.rows.length > 1 && respostaEnviada == false) {

                            respostaEnviada = true
                            res.send({
                                codigo: 400,
                                message: `Produto duplicado encontrado: cod.pdv = ${lista[i].cod_pdv}`
                            })
                        }
                        else {
                            //faz insert
                            database.query(` insert into public.produtos (nome, preco, descricao, status, img, id_categoria, id_cliente, cod_pdv)
                            values('${lista[i].nome}', '${lista[i].preco}', '${lista[i].descricao}', '${lista[i].status}', '${lista[i].img}', 1, 
                            ${filial_cliente.rows[0].id_cliente}, '${lista[i].cod_pdv}')`,
                                function (erro) {

                                    if (erro && respostaEnviada == false) {

                                        respostaEnviada = true
                                        res.send({
                                            codigo: 400,
                                            message: `Erro ao sincronizar produtos: ${erro.message}`
                                        })
                                    }
                                    else if (respostaEnviada == false && (lista.length - 1) == i) {

                                        respostaEnviada = true
                                        res.send({
                                            codigo: 200,
                                            message: "Produtos sincronizados com sucesso"
                                        })
                                    }
                                })
                        }
                    })
                }
            }
        }
        else {

            res.send({
                codigo: 400,
                message: "Cliente não encontrado"
            })
        }
    })
})

//carregar pedido da mesa e limpar
integracoes.get("/carrega/pedidosmesa/:num_mesa/:cnpj_filial/:cnpj_cliente/:token_acesso", VerificatokenAcesso, function (req, res) {

    database.query(`select pc.*, pd.*, m.id_mesa  from pedido_cabecalho pc 
    join pedido_detalhe pd on pd.id_pedido = pc.id_pedido
    join mesas m on m.num_mesa = ${req.params.num_mesa}
    where pc.id_cliente = '${req.id_cliente}' and pc.limpou_mesa = 0 
    and pc.status = 'CONCLUIDO' and m.id_cliente = '${req.id_cliente}'`, function (erro, pedidos_mesa) {

        if (erro) {

            res.send({
                codigo: 400,
                message: erro.message
            })
        }
        else if (pedidos_mesa.rows.length > 0) {

            res.send({
                codigo: 200,
                message: "Sucesso ao carregar pedidos concluidos da mesa.",
                pedidos: pedidos_mesa.rows
            })
        }
        else if (pedidos_mesa.rows.length == 0) {

            res.send({
                codigo: 400,
                message: "Mesa sem pedidos concluidos"
            })
        }
        else {

            res.send({
                codigo: 400,
                message: "Um erro inesperado  aconteceu."
            })
        }
    })
})

module.exports = integracoes