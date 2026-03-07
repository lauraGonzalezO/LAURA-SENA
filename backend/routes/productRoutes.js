/**
 * Rutas de productos
 * define los endpoints CRUD para la gestion de productos
 * endpoints:
 * POST /api/products crea un nuevo producto
 * GET /api/products obtiene todos los productos
 * GET /api/products/:id obtiene un producto por id
 * PUT /api/products/:id actualiza un producto por id
 * DELETE /api/products/:id elimina o desactiva un producto
 */

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { check } = require('express-validator');
const { verifyToken } = require('../middleswares/authJwt');
const { checkRole } = require('../middleswares/role');

const validateProduct = [

    check('name')
        .not().isEmpty()
        .withMessage('El nombre es obligatorio'),

    check('description')
        .not().isEmpty()
        .withMessage('La descripción es obligatoria'),

    check('price')
        .not().isEmpty()
        .withMessage('El precio es obligatorio'),

    check('stock')
        .not().isEmpty()
        .withMessage('El stock es obligatorio'),

    check('category')
        .not().isEmpty()
        .withMessage('La categoría es obligatoria'),

    check('subcategory')
        .not().isEmpty()
        .withMessage('La subcategoría es obligatoria'),
];


// Rutas CRUD

router.post('/',
    verifyToken,
    checkRole(['admin','coordinador','auxiliar']),
    validateProduct,
    productController.createProduct
);

router.get('/',
    verifyToken,
    productController.getProducts
);

router.get('/:id',
    verifyToken,
    productController.getProductById
);

router.put('/:id',
    verifyToken,
    checkRole(['admin','coordinador']),
    validateProduct,
    productController.updateProduct
);

router.delete('/:id',
    verifyToken,
    checkRole(['admin']),
    productController.deleteProduct
);

module.exports = router;