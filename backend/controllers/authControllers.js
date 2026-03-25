/**
 * control de autenticacion
 * maneja el registro del login y generacion de token JWT
 */ 

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');

/**
 * Signin - Iniciar sesión
 * POST /api/auth/signin
 * Body: { username, password }
 * Retorna token JWT si credenciales correctas
 */
exports.signin = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username y password son requeridos'
            });
        }

        const user = await User.findOne({ username }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        const passwordIsValid = await bcrypt.compare(password, user.password);

        if (!passwordIsValid) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        if (!user.active) {
            return res.status(401).json({
                success: false,
                message: 'Usuario inactivo'
            });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, config.secret, {
            expiresIn: config.jwtExpiration
        });

        res.status(200).json({
            success: true,
            message: 'Login exitoso',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            },
            token
        });

    } catch (error) {
        console.error('Error en signin:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor',
            error: error.message
        });
    }
};

/**
 * Signup - Registrar nuevo usuario (solo admin)
 * POST /api/auth/signup
 * Requiere token de admin
 */
exports.signup = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        if (!username || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son requeridos'
            });
        }

        const existingUser = await User.findOne({ $or: [{ username }, { email }] });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Username o email ya existe'
            });
        }

        const hashedPassword = await bcrypt.hash(password, config.saltRounds);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role
        });

        const savedUser = await newUser.save();

        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            user: {
                id: savedUser._id,
                username: savedUser.username,
                email: savedUser.email,
                role: savedUser.role
            }
        });

    } catch (error) {
        console.error('Error en signup:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear usuario',
            error: error.message
        });
    }
};

/**
 * SIGNUP: crear nuevo usuario
 * POST /api/auth/signup
 * Body {username, email, password role}
 * crea usuario en la base de datos
 * enctripta contraseña amtes de giardar con bcrypt
 * genera token JWT
 * Retorna usuario sin mostrar la contraseña
 */

exports.signup = async (req, res) => {
    try{
                // crear nuevo usuario (use el modelo User, no variable lowercase)
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            role: req.body.role || 'auxiliar' // por defecto el rol es auxiliar
        });

        //guardar en base de datos
        //la contraseña se enctripta automaticamente en el middleware del modelo
        const savedUser = await user.save();

        //generar token jwt que expira en 24 horas
        const token  = jwt.sign(
            {
            id: savedUser.id,
            role: savedUser.role,
            email: savedUser.email
            },
            config.secret,
            { expiresIn: config.jwtExpiration }
    );

        //Preparando respuesra sin mostrar la contraseña
        const UserResponse = {
            id: savedUser.username,
            username: savedUser.username,
            email: savedUser.email,
            role: savedUser.role,
        };

        res.status(200).json({
            success: true,
            message: 'Usuario registrado correctamente',
            token: token,
            user: UserResponse
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al registrar usuario',
            error: error.message
        });
    }

};

/**
 * SINGIN: Iniciar sesion
 * POST /api/auth/singin
 * body { email o usuario, password }
 * busca el usuario por email o username
 * valida la contraseña con bcrypt
 * si es correcto el token jwt
 * El token se usa para autenticar futuras solicitudes
 */
exports.signin = async(req, res) => {
    try{
        //validar que se envie el email o el username
        if(!req.body.email && !req.body.username){
            return res.status(400).json({
                success: false,
                message: 'email o username requerido'
            });
        }

        //validar que se envie la contraseña
        if(!req.body.password){
            return res.status(400).json({
                success: false,
                message: 'password requerido'
            });
        }
        //normalizar valores recibidos (username y email se almacenan en minúsculas)
        const loginUsername = req.body.username ? req.body.username.trim().toLowerCase() : undefined;
        const loginEmail = req.body.email ? req.body.email.trim().toLowerCase() : undefined;
        //buscar usuario por email o username
        const user = await User.findOne({
            $or: [
                { username: loginUsername },
                { email: loginEmail }
            ]
        }).select('+password'); //incluye password field

        // si no existe el usuario con este email o username
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        //verificar que el usuario tenga contraseña
        if(!user.password) {
            return res.status(500).json({
                success: false,
                message: 'Error interno: usuario sin contraseña'
            });
        }
        
        //comparar contraseña enviada con el hash almacenado 
        const isPasswordValid = await bcrypt.compare
        (req.body.password, user.password);

        if (!isPasswordValid){
            return res.status(401).json({
                success: false,
                message: 'Contraseña incorrecta'
            });
        }
        //Generar token JWT 24 horas
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
                email: user.email
            },
            config.secret,
            { expiresIn: config.jwtExpiration}
        );

        // prepara respuesta sin mostrar la contraseña
        const UserResponse = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        res.status(200).json({
            success: true,
            message: 'Inicio de sesion exitoso',
            token: token,
            user: UserResponse
        });
    } catch (error){
        return res.status(500).json({
            success: false,
            message: 'Error al iniciar sesion',
            error: error.message
        });
    }
};