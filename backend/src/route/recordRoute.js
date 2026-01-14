const express = require('express');
const router = express.Router();
const recordController = require('../controllers/recordController');
const { authenticateToken } = require('../middleware/auth');
const { recordValidator, idValidator } = require('../middleware/validators');

const RecordController = new recordController();
router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Records
 *   description: Gestion des records personnels
 */

/**
 * @swagger
 * /api/record/create:
 *   post:
 *     summary: Créer un nouveau record
 *     tags: [Records]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_utilisateur
 *               - id_exo
 *               - poids
 *             properties:
 *               id_utilisateur:
 *                 type: integer
 *               id_exo:
 *                 type: integer
 *               poids:
 *                 type: number
 *     responses:
 *       201:
 *         description: Record créé avec succès
 *       400:
 *         description: Erreur de validation
 *       500:
 *         description: Erreur serveur
 */
router.post('/create', recordValidator.create, (req, res) => RecordController.create(req, res));

/**
 * @swagger
 * /api/record/update/{id}:
 *   put:
 *     summary: Mettre à jour un record
 *     tags: [Records]
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
 *               poids:
 *                 type: number
 *     responses:
 *       200:
 *         description: Record mis à jour avec succès
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Record non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put('/update/:id', recordValidator.update, (req, res) => RecordController.update(req, res));

/**
 * @swagger
 * /api/record/delete/{id}:
 *   delete:
 *     summary: Supprimer un record
 *     tags: [Records]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Record supprimé avec succès
 *       404:
 *         description: Record non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete('/delete/:id', recordValidator.delete, (req, res) => RecordController.delete(req, res));

/**
 * @swagger
 * /api/record/user/{id_utilisateur}:
 *   get:
 *     summary: Récupérer tous les records d'un utilisateur
 *     tags: [Records]
 *     parameters:
 *       - in: path
 *         name: id_utilisateur
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des records de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   id_utilisateur:
 *                     type: integer
 *                   id_exo:
 *                     type: integer
 *                   poids:
 *                     type: number
 *                   date:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Erreur serveur
 */
router.get('/user/:id_utilisateur', idValidator, (req, res) => RecordController.getAllByUserId(req, res));

module.exports = router;