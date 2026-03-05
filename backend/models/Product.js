/**
 * MODELO DE PRODUCTO (MONGODB)
 * Define la estructura del producto.
 * 
 * - Un producto depende de una subcategoría, que a su vez depende de una categoría.
 * - Muchos productos pueden pertenecer a una misma subcategoría.
 * - Tiene relación con un usuario (quien lo creó).
 * - Soporta imágenes (array de URLs).
 * - Incluye validaciones para valores numéricos (no negativos).
 */

const mongoose = require('mongoose');

// Definición del esquema del producto
const productSchema = new mongoose.Schema({
    // Nombre del producto, único y requerido
    name: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        unique: true, // No pueden existir dos productos con el mismo nombre
        trim: true // Elimina espacios en blanco al inicio y final
    },

    // Descripción del producto - requerida
    description: {
        type: String,
        required: [true, 'La descripción es requerida'],
        trim: true
    },

    // Precio del producto (no puede ser negativo)
    price: {
        type: Number,
        required: [true, 'El precio es obligatorio'],
        min: [0, 'El precio no puede ser negativo']
    },

    // Cantidad de stock (no puede ser negativa)
    stock: {
        type: Number,
        required: [true, 'El stock es obligatorio'],
        min: [0, 'El stock no puede ser negativo']
    },

    // Categoría padre
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', // Se puede poblar con .populate('category')
        required: [true, 'La categoría es requerida']
    },

    // Subcategoría
    subcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subcategory', // Se puede poblar con .populate('subcategory')
        required: [true, 'La subcategoría es requerida']
    },

    // Usuario que creó el producto
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Se puede poblar para mostrar información del usuario
    },

    // Array de URLs de imágenes del producto
    images: [{
        type: String // URL de la imagen
    }],

    // Activo/inactivo (soft delete)
    isActive: {
        type: Boolean,
        default: true
    }

}, {
    timestamps: true, // Crea automáticamente los campos createdAt y updatedAt
    versionKey: false // No incluye el campo __v
});

/**
 * MIDDLEWARE POST-SAVE
 * Maneja errores de índice único (por ejemplo, nombre duplicado).
 */
productSchema.post('save', function (error, doc, next) {
    if (error.name === 'MongoServerError' && error.code === 11000) {
        return next(new Error('Ya existe un producto con ese nombre'));
    }
    next(error);
});

/**
 * Crear índice único para el nombre del producto.
 * Mejora el rendimiento en las búsquedas.
 */
productSchema.index({ name: 1 }, { unique: true });

// Exportar el modelo
module.exports = mongoose.model('Product', productSchema);