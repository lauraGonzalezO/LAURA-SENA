/**
 * Rutas de autenticación
 * Define los endpoints relacionados con la autenticación de usuarios
 * POST /api/auth/signin -> iniciar sesión
 * POST /api/auth/signup -> registrar un nuevo usuario (solo admin)
 */

const express = require('express');
const router = express.Router();

const authController = require('../controllers/authControllers');
const { verifySignUp } = require('../middleswares');
const { verifyToken } = require('../middleswares/authJwt');
const { checkRole } = require('../middleswares/role');

// Ruta para iniciar sesión
router.post('/signin', authController.signin);

// Ruta para registrar usuario (solo admin)
router.post(
  '/signup',
  verifyToken,
  checkRole('admin'),
  verifySignUp.checkDuplicateUsernameOrEmail,
  verifySignUp.checkRolesExisted,
  authController.signup
);

module.exports = router;