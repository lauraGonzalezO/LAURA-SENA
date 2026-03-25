/**
 * controlador de sub categoria
 * maneja todas las operaciones (CRUD) relacionadas con las sub-categorias
 * estructura: una subcategoria depende de una categoria padre, una categoria puede tener varias subcategorias, una subcategoria puede tener varios productos
 * cuando una subcategoria se elimina los productos relacionados se desactivan
 * cuando se ejecuta en cascada soft delete se eliminan de manera permanente
 */

const Subcategory = require('../models/Subcategory');
const Category = require('../models/Category');
const Product = require('../models/Product');

/**
 * CREATE: crear nueva sub-categoria
 * POST /api/subcategories
 */

exports.createSubcategory = async (req, res) => {
    try {
        const { name, description, category } = req.body;
        
        // Validar que los campos requeridos estén presentes
        if (!name || typeof name !== 'string' || name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'El nombre es obligatorio y debe ser texto válido'
            });
        }
        
        if (!description || typeof description !== 'string' || description.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'La descripción es obligatoria y debe ser texto válido'
            });
        }
        
        if (!category) {
            return res.status(400).json({
                success: false,
                message: 'La categoría padre es obligatoria'
            });
        }

        // Validar que la categoría padre exista
        const parentCategory = await Category.findById(category);
        if (!parentCategory) {
            return res.status(404).json({
                success: false,
                message: 'La categoría padre no existe'
            });
        }

        // Crear nueva subcategoría
        const newSubCategory = new Subcategory({
            name: name.trim(),
            description: description.trim(),
            category: category
        });
        await newSubCategory.save();
        res.status(201).json({
            success: true,
            message: 'SubCategoría creada exitosamente',
            data: newSubCategory
        });

    } catch (error) {
        console.error('Error en crear sub categoria:', error);

        // Manejo de error de índice único
        if (error.code === 11000 || error.message.includes('duplicate key')) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe una Subcategoría con ese nombre'
            });
        }

        // Error genérico del servidor
        res.status(500).json({
            success: false,
            message: 'Error al crear subcategoría',
            error: error.message
        });
    }
};

/**
 * getCategories: consultar listado de subcategorías
 * GET /api/subcategories
 * 
 * Por defecto retorna solo las subcategorías activas.
 * Con ? includeInactive=true retorna todas (incluyendo las inactivas).
 * Ordena en orden descendente por fecha de creación.
 * 
 * Retorna:
 * 200: lista de subcategorías
 * 500: error de base de datos
 */

exports.getSubcategories = async (req, res) => {
  try {
    // Por defecto solo las subcategorías activas
    // includeInactive=true permite ver desactivadas
    const includeInactive = req.query.includeInactive === 'true';
    const activeFilter = includeInactive ? {} : { active: { $ne: false } };

    const subcategories = await Subcategory.find(activeFilter).populate('category', 'name');
    res.status(200).json({
      success: true,
      data: subcategories
    });

  } catch (error) {
    console.error('Error al obtener subcategorias', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener subcategorías',
    });
  }
};

/**READ  obetener una subcategoria especificar por id 
 * GET/api/subCategories/:id
*/
exports.getSubcategoryById = async (req, res) => {
  try {
    // Por defecto solo las subcategorías activas
    // includeInactive=true permite ver desactivadas

    const subcategory = await Subcategory.findById(req.params.id).populate('category','name');
    if(!subcategory){
        return res.status(404).json({
            success:false,
            message: 'Subcategoria no encontrada'
        });
    }

    res.status(200).json({
      success: true,
      data: subcategory
    });

  } catch (error) {
    console.error('Error en obtener subcategorias por id', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener subcategorias por id',
      error: error.message
    });
  }
};

/**
 * UDPATE actualizar subcategoria existente 
 * PUT /api/subcategories/:id
 *  Auth Bearer token requerido
 * roles: admin y coordinador
 * body 
 * name: nuevo nombre de la subcategoria
 * description: nueva descripccion
 * category: nuevo id de la categoria
 * si se cambia la categoria verifica que exista 
 * validaciones
 * si quiere solo actualiza el nombre o solo la descripccion o los dos
 * retorna: 
 * 200: subcategoria actualizada
 * 404: subcategoria no encontrada
 * 500: error de base de datos
 */

exports.updateSubcategory = async (req, res) => {
    try{
        const {name,description, category} = req.body;
        // verificar la categoria cambia de padre
        if (category){
            const parentCategory = await Category.
            findById(category);
            if (!parentCategory){
                return res.status(400).json({
                    success: false, 
                    message: 'la categoria no existe'
                });
            }
        }
//  contruir objeto de actualizacvon solo con cmapos enviados
        const updatedSubCategory = await Subcategory.findByIdAndUpdate(
        req.params.id,
        { 
            name: name ? name.trim() : undefined,
            description: description ? description.trim() : undefined,
            category
        },
        {new: true, runValidators:true}
        );


        if(!updatedSubCategory){
            return res.status(404).json ({
                success: false,
                message: 'Subcategoria no encontrada'
            });
        }

        res.status(200).json({
            success:true,
            message: 'SubCategoria actualizada existosamente',
            data: updatedSubCategory
        });

    } catch (error) {

        console.error('Error en obtener subcategoria por id', error);

        res.status(500).json({
            success: false,
            message: 'Error al obtener subcategoria'
        });

    }
};


/**
 * DELETE: eliminar o desactivar una subcategoria
 * DELETE /api/subcategories/:id
 * Auth Bearer token requerido
 * roles: admin
 * query param:
 * hardDelete=true elimina permanentemente de la base de datos
 * Default: Soft delete (solo desactivar)
 * 
 * Retorna:
 * 200: subcategoria eliminada o desactivada
 * 404: subcategoria no encontrada
 * 500: Error de base de datos
 */
exports.deleteSubcategory = async (req, res) => {
    try {
        const isHardDelete = req.query.hardDelete === 'true';

        // Buscar la subcategoría a eliminar
        const subcategory = await Subcategory.findById(req.params.id);
        if (!subcategory) {
            return res.status(404).json({
                success: false,
                message: 'Subcategoría no encontrada'
            });
        }

        if(isHardDelete){
            // HARD DELETE: eliminar en cascada subcategoría y productos relacionados
            // Paso 1: eliminar todos los productos de esta subcategoría
            await Product.deleteMany({
                subcategory: req.params.id
            });

            // Paso 2: eliminar la subcategoría
            await Subcategory.findByIdAndDelete(req.params.id);

            return res.status(200).json({
                success: true,
                message: 'Subcategoría eliminada permanentemente y sus productos relacionados',
                data: subcategory
            });

        } else {
            // SOFT DELETE: solo marcar como inactiva
            subcategory.active = false;
            await subcategory.save();

            // Desactivar todos los productos relacionados
            const products = await Product.updateMany(
                { subcategory: req.params.id },
                { active: false }
            );

            return res.status(200).json({
                success: true,
                message: 'Subcategoría desactivada exitosamente',
                data: {
                    subcategory,
                    productsDeactivated: products.modifiedCount
                }
            });
        }
    } catch (error) {
        console.error('Error en deleteSubcategory:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la subcategoría',
            error: error.message
        });
    }
};