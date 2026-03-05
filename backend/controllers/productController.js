/**
 * Controlador de productos
 * Maneja todas las operaciones relacionadas con los productos (CRUD)
 * 
 * Estructura:
 * - Una subcategoría depende de una categoría padre.
 * - Una categoría puede tener varias subcategorías.
 * - Una subcategoría puede tener varios productos relacionados.
 * - Cuando una subcategoría se elimina, los productos relacionados se desactivan.
 * - Cuando se ejecuta en cascada soft delete, se eliminan de manera permanente.
 * 
 * Incluye:
 * - Soft delete (marcar como inactivo)
 * - Hard delete (eliminación permanente)
 */

const Product = require('../models/Product');
const Category = require('../models/Category');
const SubCategory = require('../models/Subcategory');

/**
 * CREATE: crear nuevo producto
 * POST /api/products
 * Body: { name, description, price, stock, category, subcategory }
 * Roles: admin y coordinador
 * 
 * Respuestas:
 * 201: producto creado
 * 400: validación fallida o nombre duplicado
 * 404: categoría o subcategoría no existe
 * 500: error interno
 */
exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, stock, category, subcategory } = req.body;

        // Validar campos requeridos
        if (!name || !description || !price || !stock || !category || !subcategory) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son requeridos',
                requiredFields: ['name', 'description', 'price', 'stock', 'category', 'subcategory']
            });
        }

        // Validar categoría
        const categoryExist = await Category.findById
        (category);
        if (!categoryExist) {
            return res.status(404).json({
                success: false,
                message: 'La categoría solicitada no existe',
                categoryId: category
            });
        }

        // Validar subcategoría
        const subCategoryExist = await SubCategory.findOne({
            _id: subcategory,
            category: category
        });
        if (!subCategoryExist) {
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
            subcategory
        });

        // Asignar creador (si está disponible)
        if (req.user && req.user._id) {
            newProduct.createdBy = req.user._id;
        }

        // Guardar producto
        const savedProduct = await newProduct.save();

        // Obtener producto con populate
        const productWithDetails = await Product.findById(savedProduct._id)
            .populate('category', 'name')
            .populate('subcategory', 'name')
            .populate('createdBy', 'username email');

        res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente',
            data: productWithDetails
        });

    } catch (error) {
        console.error('Error en createProduct:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe un producto con ese nombre'
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
 * Query: includeInactive=true -> incluir productos inactivos
 */
exports.getProducts = async (req, res) => {
    try {
        const includeInactive = req.query.includeInactive === 'true';
        const activeFilter = includeInactive ? {} : { isActive: { $ne: false } };

        const products = await Product.find(activeFilter)
            .populate('category', 'name')
            .populate('subcategory', 'name')
            .sort({ createdAt: -1 });

        // Si el usuario es auxiliar, ocultar "createdBy"
        if (req.user && req.user.role === 'Auxiliar') {
            products.forEach(product => (product.createdBy = undefined));
        }

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });

    } catch (error) {
        console.error('Error en getProducts:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los productos',
            error: error.message
        });
    }
};

/**
 * READ: obtener producto por ID
 * GET /api/products/:id
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
        console.error('Error en getProductById:', error);
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
 */
exports.updateProduct = async (req, res) => {
    try {
        const { name, description, price, stock, category, subcategory } = req.body;
        const updateData = {};

        // Agregar solo los campos enviados
        if (name) updateData.name = name;
        if (description) updateData.description = description;
        if (price) updateData.price = price;
        if (stock) updateData.stock = stock;
        if (category) updateData.category = category;
        if (subcategory) updateData.subcategory = subcategory;

        // Validar relaciones
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

        // Actualizar producto
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        )
            .populate('category', 'name')
            .populate('subcategory', 'name')
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
        console.error('Error en updateProduct:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el producto',
            error: error.message
        });
    }
};

/**
 * DELETE: eliminar o desactivar producto
 * DELETE /api/products/:id
 * Query: ?hard=true -> eliminación permanente
 */
exports.deleteProduct = async (req, res) => {
    try {
        const isHardDelete = req.query.hard === 'true';
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        if (isHardDelete) {
            await Product.findByIdAndDelete(req.params.id);
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
        console.error('Error en deleteProduct:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el producto',
            error: error.message
        });
    }
};