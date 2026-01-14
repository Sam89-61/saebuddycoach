const express = require('express');
const router = express.Router();
const EvenementController = require('../controllers/evenementController');
const { authenticateToken } = require('../middleware/auth');
const { evenementValidators, idValidator } = require('../middleware/validators');

const evenementController = new EvenementController();

// Routes publiques
router.get('/getAll', (req, res) => evenementController.getAllEvenements(req, res));

// Routes protégées
router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Evenement
 *   description: Gestion des événements
 */

/**
 * @swagger
 * /api/evenement/create:
 *   post:
 *     summary: Créer un nouvel événement
 *     tags: [Evenement]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - description
 *               - date_debut
 *               - date_fin
 *             properties:
 *               nom:
 *                 type: string
 *               description:
 *                 type: string
 *               date_debut:
 *                 type: string
 *                 format: date-time
 *               date_fin:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Evénement créé avec succès
 *       400:
 *         description: Erreur de validation
 *       500:
 *         description: Erreur serveur
 */
router.post('/create', evenementValidators.create, (req, res) => evenementController.createEvenement(req, res));

/**
 * @swagger
 * /api/evenement/update/{id}:
 *   put:
 *     summary: Mettre à jour un événement
 *     tags: [Evenement]
 *     security:
 *       - bearerAuth: []
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
 *               date_debut:
 *                 type: string
 *                 format: date-time
 *               date_fin:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Evénement mis à jour avec succès
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Evénement non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put('/update/:id', evenementValidators.update, (req, res) => evenementController.updateEvenement(req, res));

/**
 * @swagger
 * /api/evenement/delete/{id}:
 *   delete:
 *     summary: Supprimer un événement
 *     tags: [Evenement]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Evénement supprimé avec succès
 *       404:
 *         description: Evénement non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete('/delete/:id', idValidator, (req, res) => evenementController.deleteEvenement(req, res));

/**
 * @swagger
 * /api/evenement/getAll:
 *   get:
 *     summary: Récupérer tous les événements
 *     tags: [Evenement]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des événements
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nom:
 *                     type: string
 *                   description:
 *                     type: string
 *                   date_debut:
 *                     type: string
 *                     format: date-time
 *                   date_fin:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Erreur serveur
 */
router.get('/getAll', (req, res) => evenementController.getAllEvenements(req, res));

/**
 * @swagger
 * /api/evenement/addParticipation:
 *   post:
 *     summary: Ajouter une participation à un événement
 *     tags: [Evenement]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_evenement
 *               - id_profil
 *             properties:
 *               id_evenement:
 *                 type: integer
 *               id_profil:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Participation ajoutée avec succès
 *       400:
 *         description: Erreur de validation
 *       500:
 *         description: Erreur serveur
 */
router.post('/addParticipation', (req, res) => evenementController.addParticipation(req, res));

router.put('/updateParticipation', (req, res) => evenementController.updateParticipation(req, res));

router.delete('/deleteParticipation', (req, res) => evenementController.deleteParticipation(req, res));

router.get('/checkParticipation/:id_evenement/:id_utilisateur', (req, res) => evenementController.checkParticipation(req, res));

module.exports = router;
