/**
 * archivo de indice de los modelos
 * este archivo centraliza la importacion de los modelos a mongoose
 * permite importar multiples modelos de forma concisa en otros archivos
 */

const User = require('./User');
const Product = require('./Product');
const Category = require('./Category');
const Subcategory = require('./Subcategory');
const Product = require('./Product');

// Exportar todos los modelos

module.exports = {
    User,
    Product,
    Category,
    Subcategory
};