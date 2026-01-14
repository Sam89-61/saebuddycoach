const express = require('express');
const router = express.Router();
const EquipementController = require('../controllers/equipementController');
const { authenticateToken } = require('../middleware/auth');
const { equipementValidators, idValidator } = require('../middleware/validators');
const equipementController = new EquipementController();
router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Equipement
 *   description: Gestion des équipements
 */

/**
 * @swagger
 * /api/equipement/create:
 *   post:
 *     summary: Créer un nouvel équipement
 *     tags: [Equipement]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - description
 *             properties:
 *               nom:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Equipement créé avec succès
 *       400:
 *         description: Erreur de validation
 *       500:
 *         description: Erreur serveur
 */
router.post('/create', equipementValidators.create, (req, res) => equipementController.create(req, res));

/**
 * @swagger
 * /api/equipement/update/{id}:
 *   put:
 *     summary: Mettre à jour un équipement
 *     tags: [Equipement]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Equipement mis à jour avec succès
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Equipement non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put('/update/:id', equipementValidators.update, (req, res) => equipementController.updateEquipement(req, res));

/**
 * @swagger
 * /api/equipement/delete/{id}:
 *   delete:
 *     summary: Supprimer un équipement
 *     tags: [Equipement]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Equipement supprimé avec succès
 *       404:
 *         description: Equipement non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete('/delete/:id', idValidator, (req, res) => equipementController.deleteEquipement(req, res));

module.exports = router;