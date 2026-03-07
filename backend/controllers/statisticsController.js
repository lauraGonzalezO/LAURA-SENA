/**
 * Controlador de estadisticas
 * GET /api/statistics
 * Auth Bearer token requerido
 * Estadisticas disponibles:
 * total de usuarios
 * total productos
 * total de categorias
 * total de subcategorias
 */

const User = require ('../models/User');
const Product = require ('../models/Product');
const Category = require ('../models/Category');
const Subcategory = require ('../models/Subcategory');

/**
 * Respuestas
 * 200 ok estadisticas obtenidas
 * 500 Error de base de datos
 */

const getStatistics = async (req, res) => {
    try{
        //Ejecutar todas las queries en paralelo
        const [totalUsers, totalProducts, totalCategories, totalSubcategories] = await Promise.all ([
            User.countDocuments(), // contar usuarios
            Product.countDocuments(), // contar Productos
            Category.countDocuments(), // contar categorias
            Subcategory.countDocuments(), // contar sub categorias
        ]);
             //retornar las estadisticas
            res.json({
                totalUsers,
                totalProducts,
                totalCategories,
                totalSubcategories
            });
    } catch (error) {
        console.error('Error en obtener las estadisticas', error);
        res.status(500).json({
            success: false,
            message: 'error en obtener estadisticas',
            error: error.message
        });
    }
};
module.exports = {getStatistics};