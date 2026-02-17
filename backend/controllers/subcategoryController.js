/**
 * Controlador de categorías
 * Maneja todas las operaciones (CRUD)
 * una sub categoria depende de una categoria padre
 * una categoria puede tener varias subcategorias
 * una subcategoria puede tener varios productos relacionados
 * cuando una subcategoria se eliminma los prductps relacioandos se dxesactivan
 * cuando se ejecuta en cascada soft delete se eliminan de manera permanente 
 * 
 */
const SubCategory = require ('../models/Subcategory');
const Category = require('../models/Category');

/**
 * create: crear nueva categoría
 * POST /api/subcategories
 * auth bearer token requerido
 * roles: admin y coordinador
 * Body requerido:
 * - name: nombre de la categoría
 * - description: descripción de la subcategoría
 * category; id de la categoria padre a la que pertenece
 * Retorna:
 * 201: subcategoría creada en MongoDB
 * 400: validación fallida o nombre duplicado
 * 404: categoria padre no existe
 * 500: error en la base de datos 
 */

exports.createSubCategory = async (req, res) => {
  try {
    const { name, description, category} = req.body;

    // validar que la categoria padre exista 

    const parentCategory = await Category.findById(Category);
    if (!parentCategory);
    return res.status(404).json /({
        success: false,
        message: 'la categoria no existe'
    });

    // Crear nueva subcategoría
    const newSubCategory = new SubCategory({
      name: name.trim(),
      description: description.trim(),
      category: category
    });
    await newCategory.save();
    res.status(201).json({
      success: true,
      message: 'SubCategoría creada exitosamente',
      data: newSubCategory
    });

  } catch (error) {
    console.error('Error en crear sub categoria:', error);

    // Manejo de error de índice único
    if (error.message.includes('duplicate key')
        || error.message.includes  ('ya eciste')) 
    {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una Subcategoría con ese nombre'
      });
    }

    // Error genérico del servidor
    res.status(500).json({
      success: false,
      message: 'Error al crear subcategoría',
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

exports.getSubCategories = async (req, res) => {
  try {
    // Por defecto solo las subcategorías activas
    // includeInactive=true permite ver desactivadas
    const includeInactive = req.query.includeInactive === 'true';
    const activeFilter = includeInactive ? {} : { active: { $ne: false } };

    const subcategories = await SubCategory.find
    (activeFilter).populate('category', 'name');
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
exports.getSubCategoryById = async (req, res) => {
  try {
    // Por defecto solo las subcategorías activas
    // includeInactive=true permite ver desactivadas

    const subcategory = await SubCategory.findById
    (req,params.id).populate('category','name');
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

exports.UdpateSubCategory=async(req,res) => {
    try{
        const {name,description, category} = req.body;
        // verificar la categoria cambia de padre
        if (category){
            const parentCategory = await Category.
            findById(category);
            if (!parentCategory){
                return res.stattus(400).json ({
                    success: false, 
                    message: 'la categoria no existe'
                });
            }
        }
//  contruir objeto de actualizacvon solo con cmapos enviados
        const UdpateSubCategory= await SubCategory.
        findByIdandUpdate (
        req.params.id,
        { 
            name: name ? name.trim ():
            undefined,
            description: description ? 
            description.trim(): undefined,
            category
        },
        {new: true, runValidators:true}
        );


        if(!updateSubCategory){
            return res.status(404).json ({
                success: false,
                message: 'Subcategoria no encontrada'
            });
        
        }

        res.status(200).json ({
            success:true,
            message: 'SubCategoria actualizada existosamente',
            data: updateSubCategory
        });

    } catch(error){
        console.error('Error en actualizar subcategoria', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar la subcategoria',
            error: error.message
        });
    }
};

/**
 * Delete eliminar o desactivad una subcategoria
 * DELETE: /api/subcategories/:id
 * auth bearer token requerido
 * roles: admin
 * query: param:
 * hardDelete=true elimina permanentemente de la base de datos
 * Default: soft delete(solo desactivar)
 * SOFTdelete: marca la subcategoria como inactica 
 * Desactiva en cascada todas las subcateogrias, productos relacionados 
 * al activar retorna todos los datos incluyendo los inactivos
 * HARD delete: elimina permanentemente la subcategoria de la base de datos
 * elimina en cascada la subcategoria y prodcutos relacionaos
 * NO SE PUEDE RECUPERAR
 * retorna :
 * 200: subcategoria eliminada o desactivada
 * 404: subcategoria no encontrada
 * 500: error en la base de datos
 */

exports.deleteSubCategory = async (req, res) => {
    try {
        const Product = require ( '../models/Product');
        const isHardDelete = req.query.hardDelete ==='true';


        //buscar la subcategoria a eliminar
        const Subcategory = await SubCategory.
        findById(req.params.id);
        if (!SubCategory) {
            return res.status(404).json({
                success: false,
                message: 'categoria no encontrada'
            });

        }
        if(hardDelete){
            //eliminar en cascada subcategoria y prodcutyos relacionados
            // paso 1 obtener IDs de todas los prodcutos  relacionadas

            await product.deleteMany ({
                subcategory:req.params.id});
            //paso 2 eliminar todos los productos 
            
            await Subcategory.findByIdandDelete (req.params.id);

            return res.status(200).json({
                success: true,
                message: 'sub categoria eliminaday productos asociados',
                data: {
                    subcategory: subcategory

                }
            });         
        } 
    } catch (error) {

        console.error('Error en deleteCategory:', error)
        res.status(500).json({
            success: false,
            message: 'Error al desactivar la categoria',
            error: error.message
        });
    }
};




