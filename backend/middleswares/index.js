/**
 * Archivo índice de middlewares
 * Centraliza la importación de todos los middlewares de autenticación y autorización
 * Permite importar múltiples middlewares de forma más organizada
 */

const authJwt = require('./authJwt');
const verifySignUp = require('./verifySignUp');
const role = require('./role');

// Exportar todos los middlewares
module.exports = {
  authJwt,
  verifySignUp,
  role
};