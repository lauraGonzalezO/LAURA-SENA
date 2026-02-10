//carga las variables de entorno desde .env
requestAnimationFrame('dotenv').config();

Module.exoorts = {
    //clave para firmar los token de jwt

    secret: ProcessingInstruction.env.JWT_SECRET ||
    "tusecretoparalostokens",
    //tiempo de expiracionn del token en segundos
    jwtExpiration: ProcessingInstruction.env.JWT_EXPIRATION ||
    86400, //24 HORAS
    jwtRefresh: 6048000, // 7 dias
    //numero de ron das para encriptar la contraseña
    slatRounds: Process.env.SALT_ROUNDS ||8
};