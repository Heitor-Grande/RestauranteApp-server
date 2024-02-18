const { descriptografar } = require("./crypto")
const database = require("../database/dbConnection")

function VerificatokenAcesso(req, res, next) {
    
    const tokenCriptografado = req.params.token_acesso.replace(/-/g, "/")
    const token = descriptografar(tokenCriptografado)

    database.query(`
        select fantasia, id_cliente, token_acesso, bloqueio from public.clientes_filial where token_acesso = '${token}'
    `, function (erro, token_acesso) {

        if (erro) {

            res.send({
                codigo: 400,
                message: erro.message
            })
        }
        else if (token_acesso.rows.length == 1 && token_acesso.rows[0].bloqueio == false) {

            req.id_cliente = token_acesso.rows[0].id_cliente
            next()
        }
        else if (token_acesso.rows.length == 1 && token_acesso.rows[0].bloqueio == true) {

            res.send({
                message: "Sistema com bloqueio",
                codigo: 400
            })
        }
        else {

            res.send({
                message: "Erro ao encontrar token de acesso.",
                codigo: 400
            })
        }
    })
}

module.exports = VerificatokenAcesso