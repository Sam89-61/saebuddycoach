const express = require('express');
const router = express.Router();
const ClassementController = require('../controllers/classementController');
const { authenticateToken } = require('../middleware/auth');
const { classementValidators, idValidator } = require('../middleware/validators');

const classementController = new ClassementController();
router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Classement
 *   description: Gestion des classements
 */

/**
 * @swagger
 * /api/classement/create:
 *   post:
 *     summary: Créer un nouveau classement
 *     tags: [Classement]
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
 *         description: Classement créé avec succès
 *       400:
 *         description: Erreur de validation
 *       500:
 *         description: Erreur serveur
 */
router.post('/create', classementValidators.create, (req, res) => classementController.createClassement(req, res));

/**
 * @swagger
 * /api/classement/update/{id}:
 *   put:
 *     summary: Mettre à jour un classement
 *     tags: [Classement]
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
 *         description: Classement mis à jour avec succès
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Classement non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put('/update/:id', idValidator, (req, res) => classementController.updateClassement(req, res));

/**
 * @swagger
 * /api/classement/delete/{id}:
 *   delete:
 *     summary: Supprimer un classement
 *     tags: [Classement]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Classement supprimé avec succès
 *       404:
 *         description: Classement non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete('/delete/:id', idValidator, (req, res) => classementController.deleteClassement(req, res));

/**
 * @swagger
 * /api/classement/all:
 *   get:
 *     summary: Récupérer tous les classements
 *     tags: [Classement]
 *     responses:
 *       200:
 *         description: Liste des classements
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
 *       500:
 *         description: Erreur serveur
 */
router.get('/all', (req, res) => classementController.getAllClassements(req, res));

/**
 * @swagger
 * /api/classement/user/add:
 *   post:
 *     summary: Ajouter un utilisateur à un classement
 *     tags: [Classement]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_classement
 *               - id_utilisateur
 *               - score
 *             properties:
 *               id_classement:
 *                 type: integer
 *               id_utilisateur:
 *                 type: integer
 *               score:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Utilisateur ajouté au classement avec succès
 *       400:
 *         description: Erreur de validation
 *       500:
 *         description: Erreur serveur
 */
router.post('/user/add', classementValidators.submitScore, (req, res) => classementController.createClassementUser(req, res));

/**
 * @swagger
 * /api/classement/user/update/{id}:
 *   put:
 *     summary: Mettre à jour le score d'un utilisateur dans un classement
 *     tags: [Classement]
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
 *               score:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Score mis à jour avec succès
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Entrée non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.put('/user/update/:id', idValidator, (req, res) => classementController.updateClassementUser(req, res));

/**
 * @swagger
 * /api/classement/user/delete/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur d'un classement
 *     tags: [Classement]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Utilisateur supprimé du classement avec succès
 *       404:
 *         description: Entrée non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.delete('/user/delete/:id', idValidator, (req, res) => classementController.deleteClassementUser(req, res));

/**
 * @swagger
 * /api/classement/{id}/leaderboard:
 *   get:
 *     summary: Récupérer le classement (Leaderboard) et le rang de l'utilisateur
 *     tags: [Classement]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du classement (Challenge)
 *         schema:
 *           type: integer
 *       - in: query
 *         name: userId
 *         required: false
 *         description: ID de l'utilisateur pour connaître son rang spécifique
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Leaderboard Top 10 + Rang Utilisateur
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id/leaderboard', idValidator, (req, res) => classementController.getLeaderboard(req, res));

/**
 * @swagger
 * /api/classement/soumettre:
 *   post:
 *     summary: Soumettre un nouveau score pour un classement
 *     tags: [Classement]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_classement
 *               - score
 *               - url_video_preuve
 *             properties:
 *               id_classement:
 *                 type: integer
 *               score:
 *                 type: integer
 *               url_video_preuve:
 *                 type: string
 *     responses:
 *       201:
 *         description: Score soumis avec succès (En attente de validation)
 *       500:
 *         description: Erreur serveur
 */
router.post('/soumettre', (req, res) => classementController.submitScore(req, res));

/**
 * @swagger
 * /api/classement/user/classement/{id_classement}/user/{id_utilisateur}:
 *   get:
 *     summary: Récupérer le score d'un utilisateur dans un classement
 *     tags: [Classement]
 *     parameters:
 *       - in: path
 *         name: id_classement
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: id_utilisateur
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Score de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_classement:
 *                   type: integer
 *                 id_utilisateur:
 *                   type: integer
 *                 score:
 *                   type: integer
 *       404:
 *         description: Entrée non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get('/user/classement/:id_classement/user/:id_utilisateur', (req, res) => classementController.getUserByClassementAndUserId(req, res));

module.exports = router;