/**
 * controlador para las estadísticas de la aplicación
 * GET /api/statistics
 * auth Bearer token requerido
 * estadisticas disponibles:
 * total de usuarios
 * total de productos
 * total de categorias
 * total de subcategorias
 */

const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');

/**
 * respuestas
 * 200 OK con las estadísticas obtenidas
 * 500 error de base de datos o servidor 
 */

const getStatistics = async (req, res) => { 
    try {
        // ejecuta todas las queries en paralelo para mejorar rendimiento
        const [totalUsers, totalProducts, totalCategories, totalSubcategories] = await Promise.all([
            User.countDocuments(), // contar usuarios 
            Product.countDocuments(), //contar productos
            Category.countDocuments(), //contar categorias
            Subcategory.countDocuments() //contar subcategorias
        ]);

        //retornar las estadísticas
        res.json({
            success: true,
            data: {
                totalUsers,
                totalProducts,
                totalCategories,
                totalSubcategories
            }
        });
    } catch (error) {
        console.error('Error en obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas',
            error: error.message
        });
        
    }
}

module.exports = {
    getStatistics
};
