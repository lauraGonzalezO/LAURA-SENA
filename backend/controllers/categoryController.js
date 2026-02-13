/* 

controlador de categorias
maneja todas las operaciones (crud)
*/

const Category = require('../models/Categohry')
/**
 * create: crear nueva categoria
 * POST /api/categories
 * aut bearer token requerido
 * roles admin y coordinador
 * body requerido:
 * name nombre de la categortia
 * description: descripccion de la categoria
 * retorna:
 * 201: la categoria creada en MongoDB
 * 400: validacion falluda o nombre duplicado
 * 500: error en la base de datos 
 */

exports.createCategory = async(req, res) => {
    try {
        const {name,description} = req.body;
        //validacion de los campos requeridos de entrada
        if (!name || typeof name !== 'string' || name.strim ()) {
                return res.status(400).json ({
                    success: false,
                    message: 'el nombre el obligatorio y debe ser texto valido'
                });
        } 
        if (!description || typeof description !== 'string' || description.strim ()) {
                return res.status(400).json ({
                    success: false,
                    message: 'la desccripccion es obligatoria y debe ser texto valido'
                });
        } 
        //limpiar espacios en blanco
        const trimmedName = name.trim();
        const trimmedDesc = description.trim();

        // verificar si ya existe una categoria con el mismo nombre
        const existingCategory = await Category.findOne
        ({name: trimmedName});
        if (existingCategory){
            return res.status(400).json({
                success: false,
                message: 'ya existe una categoria con este nombre'
            });
        }

        //crear nueva categoria
        const newCategory = new category ({
            name: trimmedName,
            description: trimmedDesc
        });

        await newCategory.save();

        res.status(201).json ({
            success: true,
            message: 'categoria creada exitosamente',
            data: newCategory
        });

    } catch(error) {
        console.error('Error en createCategory:', error);
        //manejo de error de indice unico
        if (error.code === 11000){
            return res.status(400).json({
                success: false,
                message: 'Ya existe una categoria con ese nombre'
            });
            
        }
        // Error generico del servidor
        res.status(500).json ({
            success: false,
            message: 'Error al crear categoria',
            error: error.message
        });

    }
};

/**
 * GET consultar listador de categorias
 * GET /api/categories
 * por defecto retorna solo las categorias activas
 * con includeInactive=true retorna todas las categorias incluyendo las inactivas
 * Ordena por desendente por de creacion
 * retorna:
 * 200: lista de categorias
 * 500: error de base de datos
 */

exports.getCategories = async (req,res)= {
    // por defecto solo las categorias activas
    // IncludeInactive=true permite ver desactivadas

    const includeInactive = req.query.includeInactive === 'true';
    const activeFilter = includeInactive ? {} {active:{$ne:false}} ;

    const categories = await category.find(activeFilter),
    sort({createAt: -1});
    res.status(200).json({
        succes: true,
        data:categories
    });

};