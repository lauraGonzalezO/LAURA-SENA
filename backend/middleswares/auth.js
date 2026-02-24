/**
 * MIDDLEWARE: Authentication JWT
 * verifica que el usuario tenga un token valido y carga los datos del usuario en req.user
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * autenticar usuario
 * valida el token bearfer en e lheader autenticazion, 
 * si es valido carga los datos del usuario en req.user
 * si no es valido responde con 401 Unauthorized
 */

exports.authenticate = async (req, res, next) => {
    try {
        // extraer token del header Bearer <token
        const token = req.header('Authorization')?.
        replace('Bearer ', '');

        //verificar si nop hay token se rechaza la solicitud
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'token de autwenticacion no proporcionado',
                details: 'Incluye autorization Bearer <token> '
            });
        }
    }
};