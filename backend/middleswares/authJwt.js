/**
 * MIDDLEWARES DE VERIFICACION JWT
 * middleware para verificar y validar tokens JWT en las solicitudes
 * se usa en todas las rutas que requieren autenticación de usuario
 * características:
 * soporta dos formatos de token
 * 1 - Authorization: bearer <token> (estandar REST)
 * 2 x-access-token: (hearer personalizado)
 * extrae la informaciomn del token, (id role email)
 * la adjunta a req.user  req.userEmail
 * para uso de controladores
 * menejo de errores con codigos 403/401 apropiados
 * flujo:
 * 1. leer el header Autorization o x-access-token
 * 2. extraer el token (quita el Bearer si es necesario)
 * 3. verifica el token con JWT_SECRET
 * 4. si es valido continua al siguiente middleware o controlador
 * 5. si es invalido retorna 401 Unauthorized
 * 6. si falta retorna 403 Forbidden
 * 
 * validacion del token 
 * 1. verifica la firma del token con JWT_SECRET
 * 2. comprobar la expiracion del token
 * 3. extraer la informacion del payload (id, email, role
 */

const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');

/**
 * verificar token
 * funcionalidad
 * busca el token en las ubicaciones posbiles (orden de procedencia)
 * 1. header Authorization con formato Bearer <token>
 * 2. header x-access-token 
 * si encuentra el token, lo verifica con JWT_SECRET
 * si no lo encuentra, retorna 403 Forbidden
 * si el tokwn es invalido, retorna 401 Unauthorized
 * si es valido adjunta datos del usuario a req. y continua
 *  
 * Headers soportados
 * 1. Authorization: Bearer <sjshfjggkfkehjk...>
 * 2. x-access-token: <hhjkmhbfrdryuujhbvv...>   id, role, email 
 * propiedades del request despues del middleware:
 * req.userId = (string) id del usuario en MONGODB
 * req.userRole = (string) rol del usuario (admin, coordinador, auxiliar)
 * req.userEmail = (string) email del usuario
 */

const verifyToken = (req, res, next) => {
    try {
        // soportar dos formatos de token: Authorization
        let token = null;

        //formato 1: Authorization
        if (req.headers.authorization && req.headers.
            authorization.startsWith('Bearer ')) {
                // extraer el token del header
                token = req.headers.authorization.substring
                (7);
        }
        //formato access-token 
        else if (req.headers)
        [
    ]


    } 
}



