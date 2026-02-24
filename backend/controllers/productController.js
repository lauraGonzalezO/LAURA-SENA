/**
 * controlador de productos
 * maneja todas las operaciones relacionadas con los productos (CRUD)
 * Estructura: una sub categoria depende de una categoria padre, una categoria puede tener
 * varias subcategorias, una sub categoria puede tener varios prodcutos relacionados
 * cuando una subcategoria se elimina los productos relacionados se desactiva
 * cuando se ejecuta en cascada soft delete se eliminan de manera permanente
 * incluye soft delete (marcar como inactivo)
 * y hard delete(eliminacion permanente)
 */


const Product = require('../models/Product');
const Category = require('../models/Category');
const SubCategory = require('../models/Subcategory');

/**
 * CREATE: crear nuevo producto
 * POST /api/products
 * auth bearer token requerido
 * roles: admin y coordinador
 * Body: {name, description, price, stock, category, subcategory}
 * auth bearer token requerido
 * roles: admin y coordinador
 * 201: producto creado en MongoDB
 * 400: validación fallida o nombre duplicado
 * 404: categoria o subcategoria no existe
 * 500: error en la base de datos
 */


exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, stock, category, subcategory } = req.body;    
        // validar que todos los campos requeridos estén presentes
        if(!name || !description || !price || !stock || !category || !subcategory) {    
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son requeridos'
            });
        }
        //validar que la categoria exista
        const categoryExist = await Category.findById(category);
        if (!categoryExist) {
            return res.status(404).json({
                success: false,
                message: 'La categoría solicitada no existe'
            });
        }
        //validar que la subcategoria exista

        const subCategoryExist = await SubCategory.findOne({
        _id:subcategory,
        category: category
        });
        if (!subCategory) {
            return res.status(404).json({
                success: false,
                message: 'La subcategoría no existe o no pertenece a la categoría indicada'
            });
        }
        // Crear nuevo producto

        const newProduct = new Product({
            name,
            description,
            price,
            stock,  
            category,
        });

        // si hay subcategoria se asigna al producto

        if (req.user && req.user._id) {
            Product.createdBy = req.user._id;
        }

        // GUARDAR EL NUEVO PRODUCTO EN LA BASE DE DATOS


        const savedProduct = await newProduct.save();

        //obtener producto poblado con datos de relaciones (populate)

        const productWithDetails = await Product.findById(savedProduct._id)
        .populate('category', 'name') // solo traer el nombre de la categoria
        .populate('subcategory', 'name') // solo traer el nombre de la subcategoria
        .populate('createdBy', 'username email'); // traer datos del usuario que creó el producto

        res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente',
            data: productWithDetails
        });   
    } catch (error) {
        console.error('Error al createProduct:', error);
        //manejar error de duplicado (nombre de producto único)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'ya existe un producto con ese nombre'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error al crear el producto',
            error: error.message
        });

    }
};

/**
 * READ: obtener productos
 * GET /api/products
 * query params: 
includeInactive=true: mostrar productos inactivos (soft deleted)
default: solo productos activos
 * retorna : Array de productos poblados con categoria y subcategori
 */

exports.getProducts = async (req, res) => {
    try {
        //determinar si se deben incluir productos inactivos (soft deleted) en la consulta
        const  includeInactive = req.query.includeInactive === 'true';
        const activefilter = includeInactive ? {} : { isActive: {$ne: false} };

        //obtener productos con datos relacionados
        const products = await Product.find(activefilter)
        .populate('category', 'name') // solo traer el nombre de la categoria
        .populate('subcategory', 'name') // solo traer el nombre de la subcategoria
        .populate({createdAt: -1 }); // ordenar por fecha de creación descendente

        // si el usuario es auxiliar, no mostrar informacion de quien lo creo
        if (req.user && req.user.role === 'Auxiliar') {

            //ocultar campo createdBy para usuarios auxiliares
            products.forEach(product => {
                product.createdBy = undefined;
            });
        }   
        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        console.error('Error al getProducts:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los productos',
            error: error.message
        });
    }   
};

/**
 * RED: obtener un prodcuto especifico por ID
 * GET /api/products/:id
 * Retorna: producto poblado con categoria y subcategori
 */

exports.getProductById = async (req, res) => {

    try {
        const product = await Product.findById(req.params.id)
        .populate('category', 'name description') 
        .populate('subcategory', 'name description');
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Error al getProductById:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el producto',
            error: error.message
        });
    }   
};

/**
 * UPDATE: actualizar producto
 * PUT /api/products/:id
 * Body: {cualquier campo del producto a actualizar}
 * 
 * -solo se actualiza campos enviados
 * - si se actualiza la categoria o subcategoria, validar que existan
 * retorna: producto actualizado
 */
exports.updateProduct = async (req, res) => {
    try {
        const [name, description, price, stock, category, subcategory] = req.body;
        const updateData = {};
        //agregar solo los campos que fueron enviados 
        if (name) updateData.name = name;
        if (description) updateData.description = description;
        if (price) updateData.price = price;
        if (stock) updateData.stock = stock;
        if (category) updateData.category = category;
        if (subcategory) updateData.subcategory = subcategory;  

        //validar relaciones si se actualizar
        if(category || subcategory) {
            if (category) {
                const categoryExist = await Category.findById(category);
                if (!categoryExist) {
                    return res.status(404).json({
                        success: false,
                        message: 'La categoría solicitada no existe'
                    });
                }
            }
            if (subcategory) {
                const subCategoryExist = await SubCategory.findOne({    
                    _id: subcategory,
                    category: category || updateData.category
                });
                if (!subCategoryExist) {
                    return res.status(404).json({
                        success: false,
                        message: 'La subcategoría no existe o no pertenece a la categoría indicada'
                    });
                }
            }
        }
        //actualizar producto en BD
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { 
            new: true,
            runValidators: true
        }).   populate('category', 'name') 
             .populate('subcategory', 'name ')
             .populate('createdBy', 'username email');

        if (!updatedProduct) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Producto actualizado exitosamente',
            data: updatedProduct
        });
    } catch (error) {
        console.error('Error al updateProduct:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el producto',
            error: error.message
        });
    }
};

/**
 * DELETE: eliminar producto o desactivarlo (soft delete)
 * 
 * DELETE /api/products/:id
 * hard delete: eliminación permanente del producto de la base de datos
    * soft delete: marcar el producto como inactivo (isActive: false)
    * hard delete se ejecuta si se incluye el query param ?hard=true, de lo contrario se realiza un soft delete
 */

exports.deleteProduct = async (req, res) => {
    try {
        const ishardDelete = req.query.hard === 'true';
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false, 
                message: 'Producto no encontrado'
            });
        }
        if (ishardDelete) {
            await product.findByIdAndDelete(req.params.id);
            return res.status(200).json({
                success: true,
                message: 'Producto eliminado permanentemente de la base de datos'
            });
        } else {
            product.isActive = false;
            await product.save();
            return res.status(200).json({
                success: true,
                message: 'Producto desactivado (soft deleted) exitosamente',
                data: product
            });
        }
    } catch (error) {
        console.error('Error al deleteProduct:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el producto',
            error: error.message
        });
    }
};

