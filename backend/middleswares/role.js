/*
 * MIDDLEWARE: Control de roles de usuario
 *
 * Verifica que el usuario autenticado tenga los permisos necesarios
 * para acceder a una ruta específica.
 *
 * La función factory checkRole() permite especificar los roles permitidos.
 * También se incluyen funciones helper para roles específicos:
 * isAdmin, isCoordinador, isAuxiliar.
 *
 * Requiere que verifyToken se haya ejecutado primero.
 * 
 * Verifica que req.userRole exista y lo compara con la lista de roles permitidos.
 * 
 * - Si el rol está en la lista, continúa.
 * - Si no está, retorna 403 Forbidden con un mensaje descriptivo.
 * - Si no existe userRole, retorna 401 (token corrupto o inválido).
 *
 * Uso:
 *   checkRole('admin') → solo admin
 *   checkRole('admin', 'coordinador', 'auxiliar') → todos con permisos
 *
 * Roles del sistema:
 *   admin → acceso total
 *   coordinador → no puede eliminar ni gestionar usuarios
 *   auxiliar → acceso limitado a tareas específicas
 */

/**
 * Factory function checkRole
 * Retorna un middleware que verifica si el usuario tiene uno de los roles permitidos.
 * @param {...string} allowedRoles - Roles permitidos en el sistema
 * @returns {function} Middleware de Express
 */
const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        // Verificar que el usuario fue autenticado y verifyToken se ejecutó
        // req.userRole es establecido por el middleware verifyToken
        if (!req.userRole) {
            return res.status(401).json({
                success: false,
                message: 'Token inválido o usuario no autenticado.'
            });
        }

        // Verificar si el rol del usuario está en la lista de roles permitidos
        if (!allowedRoles.includes(req.userRole)) {
            return res.status(403).json({
                success: false,
                message: `No tienes permisos para acceder a esta ruta. Se requiere uno de: ${allowedRoles.join(' o ')}.`
            });
        }

        // Continuar con la ejecución de la ruta si el rol es válido
        next();
    };
};

// Funciones helper para roles específicos
// Uso: router.delete('/admin-only', verifyToken, isAdmin, controller.method)

const isAdmin = (req, res, next) => {
    return checkRole('admin')(req, res, next);
};

const isCoordinador = (req, res, next) => {
    return checkRole('coordinador')(req, res, next);
};

const isAuxiliar = (req, res, next) => {
    return checkRole('auxiliar')(req, res, next);
};

// Módulo a exportar
module.exports = {
    checkRole,
    isAdmin,
    isCoordinador,
    isAuxiliar
};