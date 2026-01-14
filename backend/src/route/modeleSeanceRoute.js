const express = require('express');
const router = express.Router();
const modeleSeanceController = require('../controllers/modeleSeanceController');
const { authenticateToken } = require('../middleware/auth');

// Routes pour les modèles de séance
router.get('/', authenticateToken, modeleSeanceController.getAllModeles);
router.get('/:id', authenticateToken, modeleSeanceController.getModeleById);
router.get('/:id/exos', authenticateToken, modeleSeanceController.getModeleExos);
router.post('/', authenticateToken, modeleSeanceController.createModele);
router.post('/exo', authenticateToken, modeleSeanceController.addExoToModele);

module.exports = router;
