const sessionSportController = require('../controllers/sessionSportController');
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { sessionSportValidator, idValidator } = require('../middleware/validators');
const SessionSportController = new sessionSportController();
router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: SessionSport
 *   description: Gestion des sessions de sport
 */

/**
 * @swagger
 * /api/sessionSport/create:
 *   post:
 *     summary: Créer une nouvelle session de sport
 *     tags: [SessionSport]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_programme_sportif
 *               - nom
 *             properties:
 *               id_programme_sportif:
 *                 type: integer
 *               nom:
 *                 type: string
 *     responses:
 *       201:
 *         description: Session de sport créée avec succès
 *       400:
 *         description: Erreur de validation
 *       500:
 *         description: Erreur serveur
 */
router.post('/create', sessionSportValidator.create, (req, res) => SessionSportController.createSessionSport(req, res));

/**
 * @swagger
 * /api/sessionSport/update/{id}:
 *   put:
 *     summary: Mettre à jour une session de sport
 *     tags: [SessionSport]
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
 *     responses:
 *       200:
 *         description: Session de sport mise à jour avec succès
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Session de sport non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.put('/update/:id', sessionSportValidator.update, (req, res) => SessionSportController.updateSessionSport(req, res));

/**
 * @swagger
 * /api/sessionSport/delete/{id}:
 *   delete:
 *     summary: Supprimer une session de sport
 *     tags: [SessionSport]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Session de sport supprimée avec succès
 *       404:
 *         description: Session de sport non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.delete('/delete/:id', sessionSportValidator.delete, (req, res) => SessionSportController.deleteSessionSport(req, res));

/**
 * @swagger
 * /api/sessionSport/exo/add/{id}:
 *   post:
 *     summary: Ajouter un exercice à une session de sport
 *     tags: [SessionSport]
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
 *             required:
 *               - id_exo
 *               - series
 *               - repetitions
 *               - poids
 *             properties:
 *               id_exo:
 *                 type: integer
 *               series:
 *                 type: integer
 *               repetitions:
 *                 type: integer
 *               poids:
 *                 type: number
 *     responses:
 *       201:
 *         description: Exercice ajouté avec succès
 *       400:
 *         description: Erreur de validation
 *       500:
 *         description: Erreur serveur
 */
router.post('/exo/add/:id', sessionSportValidator.add, (req, res) => SessionSportController.addExosToSession(req, res));

/**
 * @swagger
 * /api/sessionSport/exo/update/{id}:
 *   put:
 *     summary: Mettre à jour un exercice dans une session de sport
 *     tags: [SessionSport]
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
 *               series:
 *                 type: integer
 *               repetitions:
 *                 type: integer
 *               poids:
 *                 type: number
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
router.put('/exo/update/:id', sessionSportValidator.exoUpdate, (req, res) => SessionSportController.updateSessionSportExo(req, res));

/**
 * @swagger
 * /api/sessionSport/exo/delete/{id}:
 *   delete:
 *     summary: Supprimer un exercice d'une session de sport
 *     tags: [SessionSport]
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
router.delete('/exo/delete/:id', sessionSportValidator.exoDelete, (req, res) => SessionSportController.deleteSessionSportExo(req, res));

/**
 * @swagger
 * /api/sessionSport/exo/{id}:
 *   get:
 *     summary: Récupérer les exercices d'une session de sport
 *     tags: [SessionSport]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
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
 *                   id_session_sport:
 *                     type: integer
 *                   id_exo:
 *                     type: integer
 *                   series:
 *                     type: integer
 *                   repetitions:
 *                     type: integer
 *                   poids:
 *                     type: number
 *       404:
 *         description: Session de sport non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get('/exo/:id', idValidator, (req, res) => SessionSportController.getExosBySessionSportId(req, res));

/**
 * @swagger
 * /api/sessionSport/details/{id}:
 *   get:
 *     summary: Récupérer les détails complets d'une session (avec exercices enrichis)
 *     tags: [SessionSport]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détails de la session récupérés
 *       404:
 *         description: Session non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get('/details/:id', idValidator, (req, res) => SessionSportController.getSessionDetails(req, res));

/**
 * @swagger
 * /api/sessionSport/{id}/complete:
 *   put:
 *     summary: Marquer une session comme réalisée (terminée)
 *     tags: [SessionSport]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Session marquée comme réalisée
 *       404:
 *         description: Session non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id/complete', idValidator, (req, res) => SessionSportController.completeSession(req, res));

module.exports = router;