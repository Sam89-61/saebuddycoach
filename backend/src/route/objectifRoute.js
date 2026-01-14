const express = require('express');
const router = express.Router();
const ObjectifController = require('../controllers/objectifController');
const { authenticateToken } = require('../middleware/auth');
const { objectifValidators, idValidator } = require('../middleware/validators');

const objectifController = new ObjectifController();

router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Objectifs
 *   description: Gestion des objectifs
 */

/**
 * @swagger
 * /api/objectif/create:
 *   post:
 *     summary: Créer un nouvel objectif
 *     tags: [Objectifs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_profil
 *               - id_categorie
 *               - valeur_objectif
 *               - type_objectif
 *             properties:
 *               id_profil:
 *                 type: integer
 *               id_categorie:
 *                 type: integer
 *               valeur_objectif:
 *                 type: integer
 *               type_objectif:
 *                 type: string
 *     responses:
 *       201:
 *         description: Objectif créé avec succès
 *       400:
 *         description: Erreur de validation
 *       500:
 *         description: Erreur serveur
 */
router.post('/create', objectifValidators.create, (req, res) => objectifController.createObjectif(req, res));

/**
 * @swagger
 * /api/objectif/update/{id}:
 *   put:
 *     summary: Mettre à jour un objectif
 *     tags: [Objectifs]
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
 *               valeur_objectif:
 *                 type: integer
 *               est_atteint:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Objectif mis à jour avec succès
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Objectif non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put('/update/:id', idValidator, (req, res) => objectifController.updateObjectif(req, res));

/**
 * @swagger
 * /api/objectif/delete/{id}:
 *   delete:
 *     summary: Supprimer un objectif
 *     tags: [Objectifs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Objectif supprimé avec succès
 *       404:
 *         description: Objectif non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete('/delete/:id', idValidator, (req, res) => objectifController.deleteObjectif(req, res));

/**
 * @swagger
 * /api/objectif/createCategorie:
 *   post:
 *     summary: Créer une nouvelle catégorie d'objectif
 *     tags: [Objectifs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom_categorie
 *             properties:
 *               nom_categorie:
 *                 type: string
 *     responses:
 *       201:
 *         description: Catégorie créée avec succès
 *       400:
 *         description: Erreur de validation
 *       500:
 *         description: Erreur serveur
 */
router.post('/createCategorie', objectifValidators.createCategorie, (req, res) => objectifController.createCategorieObjectif(req, res));

/**
 * @swagger
 * /api/objectif/updateCategorie/{name}:
 *   put:
 *     summary: Mettre à jour une catégorie d'objectif
 *     tags: [Objectifs]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom_categorie:
 *                 type: string
 *     responses:
 *       200:
 *         description: Catégorie mise à jour avec succès
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Catégorie non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.put('/updateCategorie/:name', (req, res) => objectifController.updateCategorieObjectif(req, res));

/**
 * @swagger
 * /api/objectif/deleteCategorie/{name}:
 *   delete:
 *     summary: Supprimer une catégorie d'objectif
 *     tags: [Objectifs]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Catégorie supprimée avec succès
 *       404:
 *         description: Catégorie non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.delete('/deleteCategorie/:name', (req, res) => objectifController.deleteCategorieObjectif(req, res));

/**
 * @swagger
 * /api/objectif/getAllCategories:
 *   get:
 *     summary: Récupérer toutes les catégories d'objectifs
 *     tags: [Objectifs]
 *     responses:
 *       200:
 *         description: Liste des catégories d'objectifs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nom_categorie:
 *                     type: string
 *       500:
 *         description: Erreur serveur
 */
router.get('/getAllCategories', (req, res) => objectifController.getAllCategoriesObjectif(req, res));

module.exports = router;
