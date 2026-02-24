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
 */
exports.getAllUsers = async (req, res) => {
    try {
        const includeInactive = req.query.inactive === 'true';
        const activeFilter = includeInactive ? {} : { active: { $ne: false } };

        let users;

        if (req.user.role === 'auxiliar') {
            // Los auxiliares solo pueden ver su propio perfil
            users = await User.find({ _id: req.user._id, ...activeFilter }).select('-password');
        } else {
            // Los demás pueden ver todos los usuarios filtrados
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
 * Crear un nuevo usuario
 * POST /api/users
 */
exports.createUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role
        });

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
 * Actualizar un usuario
 * PUT /api/users/:id
 */
exports.updateUser = async (req, res) => {
    try {
        // Restricciones: auxiliar solo puede actualizar su propio perfil y no puede cambiar rol
        if (req.user.role === 'auxiliar' && req.user._id.toString() !== req.params.id) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para actualizar este usuario'
            });
        }

        if (req.user.role === 'auxiliar' && req.body.role) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para modificar tu rol'
            });
        }

        // Actualizar usuario
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Usuario actualizado correctamente',
            data: updatedUser
        });
    } catch (error) {
        console.error('Error en updateUser:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar usuario',
            error: error.message
        });
    }
};

/**
 * Eliminar un usuario (soft o hard delete)
 * DELETE /api/users/:id
 */
exports.deleteUser = async (req, res) => {
    try {
        const isHardDelete = req.query.hardDelete === 'true';
        const userToDelete = await User.findById(req.params.id);

        if (!userToDelete) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Protección: solo admin puede eliminar/desactivar admins
        if (
            userToDelete.role === 'admin' &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para eliminar o desactivar administradores'
            });
        }

        if (isHardDelete) {
            await User.findByIdAndDelete(req.params.id);
            res.status(200).json({
                success: true,
                message: 'Usuario eliminado permanentemente',
                data: userToDelete
            });
        } else {
            userToDelete.active = false;
            await userToDelete.save();
            res.status(200).json({
                success: true,
                message: 'Usuario desactivado correctamente'
            });
        }
    } catch (error) {
        console.error('Error en deleteUser:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar usuario',
            error: error.message
        });
    }
};
