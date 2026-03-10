/**
 * controlador de sub categoria
 * maneja todas las operaciones (CRUD) relacionadas con las sub-categorias
 * estructura: una subcategoria depende de una categoria padre, una categoria puede tener varias subcategorias, una subcategoria puede tener varios productos
 * cuando una subcategoria se elimina los productos relacionados se desactivan
 * cuando se ejecuta en cascada soft delete se eliminan de manera permanente
 */

const Subcategory = require('../models/Subcategory');
const Category = require('../models/Category');

/**
 * CREATE: crear nueva sub-categoria
 * POST /api/subcategories
 */

exports.createSubcategory = async (req, res) => {
    try {

        const { name, description, category } = req.body;

        // validar que la categoria padre exista
        const parentCategory = await Category.findById(category);

        if (!parentCategory) {
            return res.status(404).json({
                success: false,
                message: 'La categoria no existe'
            });
        }

        const newSubcategory = new Subcategory({
            name: name.trim(),
            description: description.trim(),
            category: category
        });

        await newSubcategory.save();

        res.status(201).json({
            success: true,
            message: 'Subcategoria creada',
            data: newSubcategory
        });

    } catch (error) {

        console.error('Error en createSubcategory:', error);

        if (error.message.includes('duplicate key')) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe una sub-categoria con ese nombre'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al crear la subcategoria'
        });

    }
};


/**
 * GET: consultar listado de sub-categorias
 * GET /api/subcategories
 */

exports.getSubcategories = async (req, res) => {

    try {

        const includeInactive = req.query.includeInactive === 'true';

        const activeFilter = includeInactive
            ? {}
            : { active: { $ne: false } };

        const subcategories = await Subcategory
            .find(activeFilter)
            .populate('category', 'name');

        res.status(200).json({
            success: true,
            data: subcategories
        });

    } catch (error) {

        console.error('Error en Subcategorias', error);

        res.status(500).json({
            success: false,
            message: 'Error al obtener subcategorias'
        });

    }
};


/**
 * READ: obtener una subcategoria por id
 * GET /api/subcategories/:id
 */

exports.getSubcategoryById = async (req, res) => {

    try {

        const subcategory = await Subcategory
            .findById(req.params.id)
            .populate('category', 'name');

        if (!subcategory) {
            return res.status(404).json({
                success: false,
                message: 'Subcategoria no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: subcategory
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
 * UPDATE: actualizar sub-categoria
 * PUT /api/subcategories/:id
 */

exports.updateSubcategory = async (req, res) => {

    try {

        const { name, description, category } = req.body;
        const updateObj = {};

        // first ensure the document exists
        const current = await Subcategory.findById(req.params.id);
        if (!current) {
            return res.status(404).json({
                success: false,
                message: 'Subcategoria no encontrada'
            });
        }

        // validate category if provided and add to update object
        if (category) {
            const parentCategory = await Category.findById(category);
            if (!parentCategory) {
                return res.status(400).json({
                    success: false,
                    message: 'La categoria no existe'
                });
            }
            updateObj.category = category;
        }

        // handle name change and duplicate check
        if (name) {
            const trimmed = name.trim();
            if (trimmed !== current.name) {
                const existing = await Subcategory.findOne({
                    name: trimmed,
                    _id: { $ne: req.params.id }
                });
                if (existing) {
                    return res.status(400).json({
                        success: false,
                        message: 'Ya existe una sub-categoria con ese nombre'
                    });
                }
            }
            updateObj.name = trimmed;
        }

        if (description) {
            updateObj.description = description.trim();
        }

        const updateSubcategory = await Subcategory.findByIdAndUpdate(
            req.params.id,
            updateObj,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Subcategoria actualizada exitosamente',
            data: updateSubcategory
        });

    } catch (error) {

        console.error('Error en actualizar subcategoria', error);

        res.status(500).json({
            success: false,
            message: 'Error al actualizar la subcategoria'
        });

    }
};


/**
 * DELETE: eliminar o desactivar una sub-categoria
 * DELETE /api/subcategories/:id
 */

exports.deleteSubcategory = async (req, res) => {

    try {

        const Product = require('../models/Product');

        const isHardDelete = req.query.hardDelete === 'true';

        const subcategory = await Subcategory.findById(req.params.id);

        if (!subcategory) {

            return res.status(404).json({
                success: false,
                message: 'Subcategoria no encontrada'
            });

        }

        if (isHardDelete) {

            // eliminar productos relacionados
            await Product.deleteMany({
                subcategory: req.params.id
            });

            // eliminar subcategoria
            await Subcategory.findByIdAndDelete(req.params.id);

            return res.status(200).json({
                success: true,
                message: 'Subcategoria eliminada permanentemente',
                data: subcategory
            });

        } else {

            // soft delete
            subcategory.active = false;

            await subcategory.save();

            const products = await Product.updateMany(
                { subcategory: req.params.id },
                { active: false }
            );

            return res.status(200).json({
                success: true,
                message: 'Subcategoria desactivada exitosamente',
                data: {
                    subcategory,
                    productsDeactivated: products.modifiedCount
                }
            });

        }

    } catch (error) {

        console.error('Error al eliminar subcategoria:', error);

        res.status(500).json({
            success: false,
            message: 'Error al eliminar la subcategoria'
        });

    }

};