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
    const includeInactive = req.query.includeInactive === 'true';
    const activeFilter = includeInactive ? {} : { active: { $ne: false } };

    const categories = await Category.find(activeFilter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: categories
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener categorías',
      error: error.message
    });
  }
};
