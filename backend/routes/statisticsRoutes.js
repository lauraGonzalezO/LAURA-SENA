/**
 * Rutas de las estadisticas
 * Define el enpoint para obtener las estadisticas generales del sistema
 */

const express = require('express');
const router = express.Router();
const { getStatistics } = require('../controllers/statisticsController');

//GET /api/statistics obtiene las estadisticas del sistema
router.get('/',
     getStatistics);

module.exports = router;