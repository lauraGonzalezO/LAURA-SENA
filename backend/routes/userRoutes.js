const express = require('express');
const router = express.Router();
const userControllers = require('../controllers/userControllers');

const { verifyToken } = require('../middleswares/authJwt');
const { checkRole } = require('../middleswares/role');

// crear usuario
router.post('/',
    verifyToken,
    checkRole('admin','coordinador'),
    userControllers.createUser
);

// obtener todos
router.get('/',
    verifyToken,
    checkRole('admin','coordinador','auxiliar'),
    userControllers.getAllUsers
);

// obtener por id
router.get('/:id',
    verifyToken,
    checkRole('admin','coordinador','auxiliar'),
    userControllers.getUserById
);

// actualizar
router.put('/:id',
    verifyToken,
    checkRole('admin','coordinador','auxiliar'),
    userControllers.updateUser
);

// eliminar
router.delete('/:id',
    verifyToken,
    checkRole('admin'),
    userControllers.deleteUser
);

module.exports = router;