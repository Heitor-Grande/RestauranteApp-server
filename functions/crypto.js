require('dotenv').config()
const crypto = require("crypto-js")

function criptografar(dado){

    const criptografado = crypto.AES.encrypt(dado, process.env.KEY_SEC).toString()
    return criptografado
}

function descriptografar(dado){

    const descriptografado = crypto.AES.decrypt(dado, process.env.KEY_SEC).toString(crypto.enc.Utf8)
    return descriptografado
}

module.exports = {criptografar, descriptografar}