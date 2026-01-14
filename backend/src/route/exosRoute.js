const express = require('express');
const router = express.Router();
const ExosController = require('../controllers/exosController');
const { authenticateToken } = require('../middleware/auth');
const { exosValidators, idValidator } = require('../middleware/validators');

const exosController = new ExosController();



/**
 * @swagger
 * tags:
 *   name: Exercices
 *   description: Gestion des exercices
 */

/**
 * @swagger
 * /api/exos/create:
 *   post:
 *     summary: Créer un nouvel exercice
 *     tags: [Exercices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - description
 *               - video
 *             properties:
 *               nom:
 *                 type: string
 *               description:
 *                 type: string
 *               video:
 *                 type: string
 *     responses:
 *       201:
 *         description: Exercice créé avec succès
 *       400:
 *         description: Erreur de validation
 *       500:
 *         description: Erreur serveur
 */
router.post('/create', exosValidators.create, (req, res) => exosController.createExo(req, res));

/**
 * @swagger
 * /api/exos/update/{id}:
 *   put:
 *     summary: Mettre à jour un exercice
 *     tags: [Exercices]
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
 *               video:
 *                 type: string
 *     responses:
 *       200:
 *         description: Exercice mis à jour avec succès
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Exercice non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put('/update/:id', exosValidators.update, (req, res) => exosController.updateExo(req, res));

/**
 * @swagger
 * /api/exos/delete/{id}:
 *   delete:
 *     summary: Supprimer un exercice
 *     tags: [Exercices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Exercice supprimé avec succès
 *       404:
 *         description: Exercice non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete('/delete/:id', idValidator, (req, res) => exosController.deleteExo(req, res));

/**
 * @swagger
 * /api/exos/getAll:
 *   get:
 *     summary: Récupérer tous les exercices
 *     tags: [Exercices]
 *     responses:
 *       200:
 *         description: Liste des exercices
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
 *                   video:
 *                     type: string
 *       500:
 *         description: Erreur serveur
 */
router.get('/getAll', (req, res) => exosController.getAllExos(req, res));

/**
 * @swagger
 * /api/exos/createPosture:
 *   post:
 *     summary: Créer une nouvelle posture de référence
 *     tags: [Exercices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_exo
 *               - posture_valide
 *             properties:
 *               id_exo:
 *                 type: integer
 *               posture_valide:
 *                 type: object
 *     responses:
 *       201:
 *         description: Posture créée avec succès
 *       400:
 *         description: Erreur de validation
 *       500:
 *         description: Erreur serveur
 */
router.post('/createPosture', exosValidators.createPosture, (req, res) => exosController.createPostureReference(req, res));

/**
 * @swagger
 * /api/exos/updatePosture/{id}:
 *   put:
 *     summary: Mettre à jour une posture de référence
 *     tags: [Exercices]
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
 *               id_exo:
 *                 type: integer
 *               posture_valide:
 *                 type: object
 *     responses:
 *       200:
 *         description: Posture mise à jour avec succès
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Posture non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.put('/updatePosture/:id', exosValidators.createPosture, (req, res) => exosController.updatePostureReference(req, res));

/**
 * @swagger
 * /api/exos/deletePosture/{id}:
 *   delete:
 *     summary: Supprimer une posture de référence
 *     tags: [Exercices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Posture supprimée avec succès
 *       404:
 *         description: Posture non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.delete('/deletePosture/:id', idValidator, (req, res) => exosController.deletePostureReference(req, res));

/**
 * @swagger
 * /api/exos/getPosturesByExo/{id}:
 *   get:
 *     summary: Récupérer les postures de référence d'un exercice
 *     tags: [Exercices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des postures
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   id_exo:
 *                     type: integer
 *                   posture_valide:
 *                     type: object
 *       404:
 *         description: Exercice non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/getPosturesByExo/:id', idValidator, (req, res) => exosController.getPosturesByExo(req, res));

module.exports = router;
