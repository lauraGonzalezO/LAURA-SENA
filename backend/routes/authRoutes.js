/**
 * Rutas de autenticacion 
 * define los endpoints relativos a autenticacion de usuarios
 * POST /api/auth/signin registar un nuevo usuario
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authControllers');
const { verifySignup } = require('../middleswares');
const { verifyToken } = require('../middleswares/authJwt');
const { checkRole } = require('../middleswares/role');

//Rutas de autenticacion

//Requiere email-usuario y password
router.post('/signin', authController.signin);

router.post('/signup',
    verifyToken,
    checkRole('admin'),
    verifySignup.checkDuplicateUsernameOrEmail,
    verifySignup.checkRolesExisted,
    authController.signup
);

module.exports = router; 