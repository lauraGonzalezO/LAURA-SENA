/*
    * Controlador de autenticacion
    * Maneja el registro login y generacion de token JWT
*/

const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');

/* 
    * Signup ; crear nuevo usuario
    * POST /api/auth/signup
    * Body { username, email, password, role }
*/

exports.signup = async (req, res) => {
    try {
        // crear nuevo usuario
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            role: req.body.role || 'Auxiliar' // por defecto el rol es auxiliar
        });

        // guardar en base de datos
        const savedUser = await user.save();

        // generar token JWT que expira en 24H
        const token = jwt.sign(
            {
                id: savedUser._id,
                role: savedUser.role,
                email: savedUser.email
            },
            config.secret,
            { expiresIn: config.jwtExpiration } // 24H
        );

        // preparando respuesta sin mostrar la contraseña
        const userResponse = {
            id: savedUser._id,
            username: savedUser.username,
            email: savedUser.email,
            role: savedUser.role,
        };

        res.status(200).json({
            success: true,
            message: 'Usuario creado correctamente',
            token: token,
            user: userResponse
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al crear usuario',
            error: error.message
        });
    }
};


/*
    *singin: iniciar sesion
    *post /api/auth/singin
    *body {email o usuario, password}
    *busca el usuario por email o username
    *valida la contraseña con bcrypt
    *si es correcto el token jwt
    *token se usa para autenticar futuras solicitudes
*/

exports.signup = async(req,res) => {
    try{
        //validar que se envie el email o username
        if(!req.body.email && !req.body.username){
            return res.status(400).json({
                success:false ,
                message: 'email o username es requerido'
            });
        }

        //validar que se envie la contraseña
        if(!req.body.password){
            return res.status(400).json({
                success: false,
                message: 'password requerida'
            });
        }

        // buscar usuario por email o username 
        const user = await User.findOne({
            $or:[
                {username: req.body.username},
                {email: req.body.email}
            ]
        }).select('password'); //include password field

        //sino existe el usuario con este email o username
        if(!user){
            return res.status(404).json({
                success:false,
                message:'usuario no encontrado'
            });

        }

        //verificar que el usuario tenga contraseña
        if(!user.password) {
            return res.status(500).json({
                success:false,
                message:'Error interno: usuario sin contraseña'
            });
        }

        //comparar contraseña enviada cpn el hash almacenad
        const isPasswordValid = await bcrypt.compare(
            req.body.password, user.password);
        if (!isPasswordValid){
            return res.status(401).json({
                success:false,
                message: 'Contraseña incorrecta'
            });
        }
    }
}