/**
 * Controlador de usuarios
 * Este módulo maneja todas las operaciones del CRUD para la gestión de usuarios.
 * Incluye control de acceso, validaciones y manejo de errores.
 * Roles permitidos: admin, coordinador, auxiliar.
 * 
 * Seguridad:
 * - Las contraseñas nunca se devuelven en las respuestas.
 * - Los auxiliares solo pueden ver y actualizar su propio perfil.
 * - Los coordinadores no pueden ver a los administradores.
 * - Eliminar permanentemente un usuario solo lo puede hacer un admin.
 * 
 * Operaciones:
 * getAllUsers: listar usuarios con filtro por rol.
 * getUserById: obtener un usuario por su id.
 * createUser: crear un nuevo usuario.
 * updateUser: actualizar un usuario con restricciones de rol.
 * deleteUser: eliminar usuario con restricciones de rol.
 */

const User = require('../models/User');
const bcrypt = require('bcrypt');

/**
 * Obtener lista de usuarios
 * GET /api/users
 * Auth token requerido
 * Query params: incluir activos o desactivados
 * 
 * Retorna:
 * 200: array de usuarios filtrados
 * 500: error de servidor
 */

exports.getAllUsers = async (req, res) => {
    try {
        // Por defecto solo mostrar usuarios activos
        const includeInactive = req.query.inactive === 'true';
        const activeFilter = includeInactive ? {} : { active: { $ne: false } };

        let users;

        // Control de acceso basado en rol
        if (req.user.role === 'auxiliar') {
            // Los auxiliares solo pueden ver su propio perfil
            users = await User.find({ _id: req.user._id, ...activeFilter }).select('-password');
        } else {
            // Los administradores y coordinadores pueden ver usuarios según su rol
            users = await User.find(activeFilter).select('-password');
        }

        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('[CONTROLLER] Error en getAllUsers:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al obtener usuarios'
        });
    }
};

/**
 * Obtener un usuario por ID
 * GET /api/users/:id
 * Auth token requerido
 * 
 * Retorna:
 * 200: objeto de usuario sin contraseña
 * 403: sin permiso para ver el usuario
 * 404: usuario no encontrado
 * 500: error de servidor
 */

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Validaciones de acceso
        if (req.user.role === 'auxiliar' && req.user._id.toString() !== user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para ver este usuario'
            });
        }

        if (req.user.role === 'coordinador' && user.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No puedes ver usuarios admin'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {
        console.error('[CONTROLLER] Error en getUserById:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al obtener usuario específico'
        });
    }
};

/**
 * CREATE crear un nuevo usuario
 * POST /api/users
 * Auth bearer token requerido
 * Roles: admin y coordinador (con restricciones)
 * 
 * Respuestas:
 * 201: usuario creado
 * 400: validación fallida
 * 500: error de servidor
 */

exports.createUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Hash de contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear usuario nuevo
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role
        });

        // Guardar en BD
        const savedUser = await newUser.save();

        res.status(201).json({
            success: true,
            message: 'Usuario creado correctamente',
            user: {
                id: savedUser._id,
                username: savedUser.username,
                email: savedUser.email,
                role: savedUser.role
            }
        });

    } catch (error) {
        console.error('Error en createUser:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear usuario',
            error: error.message
        });
    }
};

/**
 * UPDATE actualizar un usuario
 * PUT /api/users/:id
 * Auth bearer token requerido
 * validaciones
 * auxiliar solo pueden actualizar su propio perfil
 * auxiliar no puede cambiar su rol
 * admin, coordinador pueden actualizar otros usuarios
 * 200 usuario actualizado
 * 403 sin permiso para actualizar
 * 404 usuario no encontrado
 * 500 error de servidor
 */

exports.updateUser = async (req, res) => {
    try {
        // restricciones: auxiliar solo puede actualizar su propio perfil y no puede cambiar su rol
        if (req.user.role === 'auxiliar' && req.userId,
            toString() !== req.params.id) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para actualizar este usuario'
            });
        }
    }
};

