const express = require('express');
const router = express.Router();
const AlimentationController = require('../controllers/alimentationController');
const { authenticateToken } = require('../middleware/auth');
const { alimentationValidators, idValidator } = require('../middleware/validators');

const alimentationController = new AlimentationController();

router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Alimentation
 *   description: Gestion de l'alimentation
 */

// Routes Plat
/**
 * @swagger
 * /api/alimentation/plat/create:
 *   post:
 *     summary: Créer un nouveau plat
 *     tags: [Alimentation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - Kcal
 *               - description
 *             properties:
 *               nom:
 *                 type: string
 *               Kcal:
 *                 type: integer
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Plat créé avec succès
 *       400:
 *         description: Erreur de validation
 *       500:
 *         description: Erreur serveur
 */
router.post('/plat/create', alimentationValidators.createPlat, (req, res) => alimentationController.createPlat(req, res));

/**
 * @swagger
 * /api/alimentation/plat/update/{id}:
 *   put:
 *     summary: Mettre à jour un plat
 *     tags: [Alimentation]
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
 *               Kcal:
 *                 type: integer
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Plat mis à jour avec succès
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Plat non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put('/plat/update/:id', alimentationValidators.createPlat, (req, res) => alimentationController.updatePlat(req, res));

/**
 * @swagger
 * /api/alimentation/plat/delete/{id}:
 *   delete:
 *     summary: Supprimer un plat
 *     tags: [Alimentation]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Plat supprimé avec succès
 *       404:
 *         description: Plat non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete('/plat/delete/:id', idValidator, (req, res) => alimentationController.deletePlat(req, res));

/**
 * @swagger
 * /api/alimentation/plat/getAll:
 *   get:
 *     summary: Récupérer tous les plats
 *     tags: [Alimentation]
 *     responses:
 *       200:
 *         description: Liste des plats
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
 *                   Kcal:
 *                     type: integer
 *                   description:
 *                     type: string
 *       500:
 *         description: Erreur serveur
 */
router.get('/plat/getAll', (req, res) => alimentationController.getAllPlats(req, res));

// Routes Entrée
/**
 * @swagger
 * /api/alimentation/entree/create:
 *   post:
 *     summary: Créer une nouvelle entrée
 *     tags: [Alimentation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - Kcal
 *               - description
 *             properties:
 *               nom:
 *                 type: string
 *               Kcal:
 *                 type: integer
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Entrée créée avec succès
 *       400:
 *         description: Erreur de validation
 *       500:
 *         description: Erreur serveur
 */
router.post('/entree/create', alimentationValidators.createEntree, (req, res) => alimentationController.createEntree(req, res));

/**
 * @swagger
 * /api/alimentation/entree/update/{id}:
 *   put:
 *     summary: Mettre à jour une entrée
 *     tags: [Alimentation]
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
 *               Kcal:
 *                 type: integer
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Entrée mise à jour avec succès
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Entrée non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.put('/entree/update/:id', alimentationValidators.createEntree, (req, res) => alimentationController.updateEntree(req, res));

/**
 * @swagger
 * /api/alimentation/entree/delete/{id}:
 *   delete:
 *     summary: Supprimer une entrée
 *     tags: [Alimentation]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Entrée supprimée avec succès
 *       404:
 *         description: Entrée non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.delete('/entree/delete/:id', idValidator, (req, res) => alimentationController.deleteEntree(req, res));

/**
 * @swagger
 * /api/alimentation/entree/getAll:
 *   get:
 *     summary: Récupérer toutes les entrées
 *     tags: [Alimentation]
 *     responses:
 *       200:
 *         description: Liste des entrées
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
 *                   Kcal:
 *                     type: integer
 *                   description:
 *                     type: string
 *       500:
 *         description: Erreur serveur
 */
router.get('/entree/getAll', (req, res) => alimentationController.getAllEntrees(req, res));

// Routes Dessert
/**
 * @swagger
 * /api/alimentation/dessert/create:
 *   post:
 *     summary: Créer un nouveau dessert
 *     tags: [Alimentation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - Kcal
 *               - description
 *             properties:
 *               nom:
 *                 type: string
 *               Kcal:
 *                 type: integer
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Dessert créé avec succès
 *       400:
 *         description: Erreur de validation
 *       500:
 *         description: Erreur serveur
 */
router.post('/dessert/create', alimentationValidators.createDessert, (req, res) => alimentationController.createDessert(req, res));

/**
 * @swagger
 * /api/alimentation/dessert/update/{id}:
 *   put:
 *     summary: Mettre à jour un dessert
 *     tags: [Alimentation]
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
 *               Kcal:
 *                 type: integer
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Dessert mis à jour avec succès
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Dessert non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put('/dessert/update/:id', alimentationValidators.createDessert, (req, res) => alimentationController.updateDessert(req, res));

/**
 * @swagger
 * /api/alimentation/dessert/delete/{id}:
 *   delete:
 *     summary: Supprimer un dessert
 *     tags: [Alimentation]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dessert supprimé avec succès
 *       404:
 *         description: Dessert non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete('/dessert/delete/:id', idValidator, (req, res) => alimentationController.deleteDessert(req, res));

/**
 * @swagger
 * /api/alimentation/dessert/getAll:
 *   get:
 *     summary: Récupérer tous les desserts
 *     tags: [Alimentation]
 *     responses:
 *       200:
 *         description: Liste des desserts
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
 *                   Kcal:
 *                     type: integer
 *                   description:
 *                     type: string
 *       500:
 *         description: Erreur serveur
 */
router.get('/dessert/getAll', (req, res) => alimentationController.getAllDesserts(req, res));

module.exports = router;