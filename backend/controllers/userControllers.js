/**
 * Controlador de usuarios
 * Este modulo maneja todas las operaciones del CRUD para la gestion de usuarios
 */

const User = require('../models/User');
const bcrypt = require('bcryptjs');

/**
 * GET /api/users
 * Obtener todos los usuarios
 */

exports.getAllUsers = async (req, res) => {
    try {

        const includeInactive = req.query.includeInactive === 'true';
        const activeFilter = includeInactive ? {} : { active: { $ne: false } };

        let users;

        // control de acceso basado en rol
        if (req.userRole === 'auxiliar') {

            // auxiliar solo puede verse a sí mismo
            users = await User.find({
                _id: req.userId,
                ...activeFilter
            }).select('-password');

        } else {

            // admin y coordinador ven todos
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
            message: 'Error al obtener los usuarios'
        });

    }
};


/**
 * GET /api/users/:id
 * Obtener usuario por ID
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

        // auxiliar solo puede ver su propio perfil
        if (req.userRole === 'auxiliar' && req.userId !== user._id.toString()) {

            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para ver este usuario'
            });

        }

        // coordinador no puede ver admins
        if (req.userRole === 'coordinador' && user.role === 'admin') {

            return res.status(403).json({
                success: false,
                message: 'No puedes ver usuarios administradores'
            });

        }

        res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {

        console.error('Error en getUserById:', error.message);

        res.status(500).json({
            success: false,
            message: 'Error al obtener el usuario'
        });

    }
};


/**
 * POST /api/users
 * Crear usuario
 */

exports.createUser = async (req, res) => {

    try {

        const { username, email, password, role } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            username,
            email,
            password: hashedPassword,
            role
        });

        const savedUser = await user.save();

        res.status(201).json({
            success: true,
            message: 'Usuario creado correctamente',
            data: {
                id: savedUser._id,
                username: savedUser.username,
                email: savedUser.email,
                role: savedUser.role
            }
        });

    } catch (error) {

        console.error('Error al crear usuario:', error);

        res.status(500).json({
            success: false,
            message: 'Error al crear usuario'
        });

    }
};


/**
 * PUT /api/users/:id
 * Actualizar usuario
 */

exports.updateUser = async (req, res) => {

    try {

        // auxiliar solo puede editar su propio perfil
        if (req.userRole === 'auxiliar' && req.userId !== req.params.id) {

            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para actualizar este usuario'
            });

        }

        // auxiliar no puede cambiar rol
        if (req.userRole === 'auxiliar' && req.body.role) {

            return res.status(403).json({
                success: false,
                message: 'No puedes modificar tu rol'
            });

        }

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
            message: 'Error al actualizar usuario'
        });

    }
};


/**
 * DELETE /api/users/:id
 * Eliminar o desactivar usuario
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

        // proteger administradores
        if (
            userToDelete.role === 'admin' &&
            userToDelete._id.toString() !== req.userId
        ) {

            return res.status(403).json({
                success: false,
                message: 'No puedes eliminar otro administrador'
            });

        }

        if (isHardDelete) {

            await User.findByIdAndDelete(req.params.id);

            return res.status(200).json({
                success: true,
                message: 'Usuario eliminado permanentemente'
            });

        } else {

            userToDelete.active = false;
            await userToDelete.save();

            return res.status(200).json({
                success: true,
                message: 'Usuario desactivado correctamente'
            });

        }

    } catch (error) {

        console.error('Error en deleteUser:', error);

        res.status(500).json({
            success: false,
            message: 'Error al eliminar usuario'
        });

    }
};