/**
 * MIDDLEWARE control de roles de usuario
 * 
 * sirve para verificar que el usuario autenticado tiene permisos necesarios para acceder a una ruta especifica
 * 
 * funcion factory checkRole() permite especificar roles permitidos 
 * funcion Helper para roles especificos isAdmin, isCoordinador, isAuxiliar
 * requiere que verifytoken se haya ejecutado primero
 * flujo:
 * verifica que req.userRole existe
 * compara req.userRole contra lista de roles permitidos
 * si esta en lista continua
 * si no esta en la lista retorna 403 Forbidden con mensaje descriptivo
 * si no existe UserRole retorna 401 (Token corrupto)
 * 
 * uso:
 * checkRole ('admin') solo admin
 * checkRole ('admin', 'coordinador', 'auxiliar') admin y coordinador con permisos
 * checkRole ('admin', 'coordinador', 'auxiliar') todos con permisos
 * Roles del sistema:
 * admin acceso total
 * coordinador no puede eliminar ni gestionar usuarios
 * auxiliar acceso limitado a tareas especificas
 */

/**
 * factory function checkRole
 * retorna middleware qque verifica si el usuario tiene uno de los roles permitidos
 * @param {...string} allowedRoles roles permitidos en el sistema
 * @return {function} middleware de express  
 */
const checkRole = (...allowedRoles) => {
    // some callers mistakenly pass an array of roles instead of separate args
    // flatten in case any element is itself an array so both `checkRole('a','b')`
    // and `checkRole(['a','b'])` work the same way.
    allowedRoles = allowedRoles.flat();

    return (req, res, next) => {
        // validar que el usuario fue autenticado y verifyToken ejecutado
        // req.userRole es establecido por verifyToken middleware
        if (!req.userRole){
            return res.status(401).json({
                success: false,
                message: 'Token inválido o expirado.'
            });
        }
        // verificar si el rol del usuario esta en la lista de roles
        // DEBUG: mostrar roles permitidos y rol del usuario
        console.log(`[role] allowed=[${allowedRoles.join(',')}] user=${req.userRole}`);
        if(!allowedRoles.includes(req.userRole)){
            return res.status(403).json({
                success: false,
                message: `Permisos insuficientes de requiere: ${allowedRoles.join(',')}`
            });
        }
        // Usuario tiene permiso continuar
        next();
    }
};
//funciones helper para roles especificos
//Uso: router.delete('/admin/only'. verifyToken, isAdmin, controller.method);

//Verifica si el usuario es admin
const isAdmin = (req, res, next ) => {
    return checkRole('admin')(req, res, next);
};
//verificar si el usuario es coordinador
const isCoordinador = (req, res, next ) => {
    return checkRole('coordinador')(req, res, next);
};
//verificar si el usuario es auxiliar
const isAuxiliar = (req, res, next ) => {
    return checkRole('auxiliar')(req, res, next);
};

//Modulos a exportar

module.exports = {
    checkRole,
    isAdmin,
    isCoordinador,
    isAuxiliar
};