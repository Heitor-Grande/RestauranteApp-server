require('dotenv').config()
const jwt = require("jsonwebtoken")


function gerarJWT(dado, callback){

    jwt.sign({
        data: dado
      }, process.env.KEY_JWT, { expiresIn: '5h' }, function(erro, token){
        if(erro){
            callback(erro, null)
        }
        else{
            callback(null, token)
        }
      })
}

/*FUNCIONAMENTO gerarJWT:

gerarJWT(dado, (erro, token) => {
    if (erro) {
      // Se houver um erro, retorne-o na resposta
      res.send({ erro: "Erro ao gerar token" });
    } else {
      // Se o token for gerado com sucesso, retorne-o na resposta
      res.send({ token });
    }
  })

*/

function verificaJWT(token, callback){
    jwt.verify(token, process.env.KEY_JWT, function(erro, token_decodificado){
        if(erro){
            callback(erro, null)
        }
        else{
            callback(null, token_decodificado)
        }
    })
}

module.exports = {gerarJWT, verificaJWT}