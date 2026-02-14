/**
 * Controlador de categorías
 * Maneja todas las operaciones (CRUD)
 */

const Category = require('../models/Category');

/**
 * create: crear nueva categoría
 * POST /api/categories
 * auth bearer token requerido
 * roles: admin y coordinador
 * 
 * Body requerido:
 * - name: nombre de la categoría
 * - description: descripción de la categoría
 * 
 * Retorna:
 * 201: categoría creada en MongoDB
 * 400: validación fallida o nombre duplicado
 * 500: error en la base de datos 
 */

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validación de los campos requeridos
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'El nombre es obligatorio y debe ser un texto válido'
      });
    }

    if (!description || typeof description !== 'string' || description.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'La descripción es obligatoria y debe ser un texto válido'
      });
    }

    // Limpiar espacios en blanco
    const trimmedName = name.trim();
    const trimmedDesc = description.trim();

    // Verificar si ya existe una categoría con el mismo nombre
    const existingCategory = await Category.findOne({ name: trimmedName });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una categoría con este nombre'
      });
    }

    // Crear nueva categoría
    const newCategory = new Category({
      name: trimmedName,
      description: trimmedDesc
    });

    await newCategory.save();

    res.status(201).json({
      success: true,
      message: 'Categoría creada exitosamente',
      data: newCategory
    });

  } catch (error) {
    console.error('Error en createCategory:', error);

    // Manejo de error de índice único
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una categoría con ese nombre'
      });
    }

    // Error genérico del servidor
    res.status(500).json({
      success: false,
      message: 'Error al crear categoría',
      error: error.message
    });
  }
};

/**
 * getCategories: consultar listado de categorías
 * GET /api/categories
 * 
 * Por defecto retorna solo las categorías activas.
 * Con ?includeInactive=true retorna todas (incluyendo las inactivas).
 * Ordena en orden descendente por fecha de creación.
 * 
 * Retorna:
 * 200: lista de categorías
 * 500: error de base de datos
 */

exports.getCategories = async (req, res) => {
  try {
    // Por defecto solo las categorías activas
    // includeInactive=true permite ver desactivadas
    const includeInactive = req.query.includeInactive === 'true';
    const activeFilter = includeInactive ? {} : { active: { $ne: false } };

    const categories = await Category.find(activeFilter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Error en getCategorias', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener categorías',
      error: error.message
    });
  }
};

/**READ  obetener una categoria especificar por id 
 * GET/api/Categories/:id
*/
exports.getCategoryById = async (req, res) => {
  try {
    // Por defecto solo las categorías activas
    // includeInactive=true permite ver desactivadas

    const category = await Category.findById(req,params.id);
    if(!Category){
        return res.status(404).json({
            success:false,
            message: 'categoria no encontrada'
        });
    }

    res.status(200).json({
      success: true,
      data: category
    });

  } catch (error) {
    console.error('Error en getCategoryById', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener categoria',
      error: error.message
    });
  }
};

/**
 * UDPATE actualizar categoria existente 
 * PUT /api/categories/:id
 *  Auth Bearer token requerido
 * roles: admin y coordinador
 * body 
 * name: nuevo nombre de la categoria
 * description: nueva descripccion
 * validaciones
 * si quiere solo actualiza el nombre o solo la descripccion o los dos
 * retorna: 
 * 200: categoria actualizada
 * 400: nombre duplicado
 * 404: categoria no encontrada
 * 500: error de base de datos
 */

exports.UdpateCategory=async(req,res) => {
    try{
        const {name,description} = req.body;
        const updateData ={};

        // solo actualizar campos que fueron enviados
        if (name){
            updateData.name = name-trim();

            // verificar si el nuevo nombre ya existe en categoria
            const existingCategory = await Category.findOne ({
                name: updateData.name,
                _id:{$ne: req.params.id} // asegura< que el nombre no sea el mismo
            });
            if(existing){
                return res.status(400).json({
                    success: false,
                    message: 'este usuario ya existe'
                });
            }
        }

        if(description){
            updateData.description= description.trim();
        }

        // Actualizar la categoria en la base de datos
        const UdpateCategory= await Category.
        findByIdandUpdate (
        req.params.id,
        updateData,
        { new: true, runValidators:true}
        );


        if(!updatedCategory){
            return res.status(404).json ({
                success: false,
                message: 'Categoria no encontrada'

            });
        
        }

        res.status(200).json ({
            success:true,
            message: 'Categoria actualizada existosamente',
            data: updatedCategory
        });

    } catch(error){
        console.error('Error en updateCategory', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar la categoria',
            error: error.message
        });
    }
};

/**
 * Delete eliminar o desactivad una categoria
 * DELETE: /api/categories/:id
 * auth bearer token requerido
 * roles: admin
 * query: param:
 * hardDelete=true elimina permanentemente de la base de datos
 * Default: soft delete(solo desactivar)
 * SOFTdelete: marca la categoria como inactica 
 * Desactiva en cascada todas las subcateogrias, productos relacionados 
 * al activar retorna todos los datos incluyendo los inactivos
 * 
 * HARD delete: elimina permanentemente la categoria de la base de datos
 * 
 * elimina en cascada la categoria, subcategorias y prodcutos relacionaos
 * NO SE PUEDE RECUPERAR
 * 
 * retorna :
 * 200: categoria eliminada o desactivada
 * 404: categoria no encontrada
 * 500: error en la base de datos
 */

exports.deleteCategory = async (req, res) => {
    try {
        const SubCategory = require ( '../models/Subcategory');
        const Product = require ('../models/Product');
        const isHardDelete = req.query.hardDelete ==='true';


        //buscar la categoria a eliminar
        const category = await Category.findById(req.params.id);
        if (!Category) {
            return res.status(404).json({
                success: false,
                message: 'categoria no encontrada'
            });

        }
        if(hardDelete){
            //eliminar en cascada subcategorias y prodcutyos relacionados
            // paso 1 obtener IDs de todas las subcategorias relacionadas

            const subIds = (await SubCategory.find({
                category: req.params.id})).map(s =>s.id);
                //paso 2 eliminar todos los productos

            await Product.deleteMany ({
                category:req, params,id});

            //paso 3 eliminar todos los productos 
            // de las subcategorias de esta categoria
            await Product.deleteMany({
                subcategory:{
                    $in: subIds}
            });

            //paso 4 eliminar todas las subcategorias de esta categoria
            await SubCategory.deleteMany ({ category: req.params.id
            });

            //paso 5 eliminar misma categoria
            await Category.findByIdandDelete(req.params.id);
            res.status(200).json({ 
                success: true,
                message: 'Categoria eliminada permanentemente y sus subcategorias y productos relacionados',
                data: {
                    category: category
                }
            });
        } else {
            //soft delete solo marcar como inactivo con cascada
            category.active = false;
            await category.save();

            //desactivar todas las subcategorias relacionadas
            const subcategories = await SubCategory.updateMany(
                {category: req.params.id},
                {active:false}
            );

            //desactivar todos los productos relacionados por la categoria y subcategoria
            const products = await Product.updateMany(
                {category: req.params.id},
                {active:false}
            );

            res.status(200).json({
                success: true,
                message: 'Categoria desctivada exitosamente y suscategorias y productos asociados',
                data: {
                    category: category,
                    subcategoriesDeactivated:
                    subcategories.modifiedCount,
                    productsDeactivated: products.modifiedCount
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




