//carga las variables de entorno desde .env
require('dotenv').config();

module.exports = {
    //clave para firmar los token de jwt
    secret: process.env.JWT_SECRET ||
    "tusecretoparalostokens",
    //tiempo de expiracionn del token en segundos
    jwtExpiration: process.env.JWT_EXPIRATION ||
    86400, //24 HORAS
    jwtRefresh: 6048000, // 7 dias
    //numero de ron das para encriptar la contraseña
    saltRounds: process.env.SALT_ROUNDS || 8
};