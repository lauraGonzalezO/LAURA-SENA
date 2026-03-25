/**
 * Modelo de categoría (MongoDB)
 * Define la estructura de la categoría
 */

const mongoose = require('mongoose');

// Esquema de categoría
const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'La descripción es requerida'],
        trim: true
    },
    // Soft delete (activar/desactivar sin eliminar)
    active: {
        type: Boolean,
        default: true
    }

}, {
    timestamps: true,
    versionKey: false
});

/**
 * Índice único para el nombre
 * Evita duplicados y mejora búsquedas
 */
categorySchema.index(
    { name: 1 },
    {
        unique: true,
        name: 'name_1'
    }
);

// Exportar modelo
module.exports = mongoose.model('Category', categorySchema);