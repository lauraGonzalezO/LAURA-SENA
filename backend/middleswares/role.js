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
    return (req, res, next) => {
        //validar que el usuario fue autenticado y veryfyToken ejecutado
        //req, userRole es establecido por veryfyToken middleware
        if (!req.userRole){
            return res.status(401)({
                success: false,
                message: 'Token invalido o expirado'
            });
        }
        //verificar si el rol del usuario esta en la lista de roles
        if(!allowedRoles.includes(req.userRole)){
            return res.status(403).json({
                success: false,
                message: `Permisos insuficientes de requiere: ${allowedRoles.join('0')}`
            });
        }
        //Usuario tiene permiso continuar
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