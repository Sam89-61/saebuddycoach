const express = require('express');
const router = express.Router();
const ProfilController = require('../controllers/profilController');
const { authenticateToken } = require('../middleware/auth');
const { profilValidators, idValidator } = require('../middleware/validators');
const profilController = new ProfilController();

router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Profil
 *   description: Gestion des profils utilisateur
 */

/**
 * @swagger
 * /api/profil/create:
 *   post:
 *     summary: Créer un nouveau profil
 *     tags: [Profil]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_utilisateur
 *               - nom
 *               - prenom
 *               - date_naissance
 *               - sexe
 *             properties:
 *               id_utilisateur:
 *                 type: integer
 *               nom:
 *                 type: string
 *               prenom:
 *                 type: string
 *               date_naissance:
 *                 type: string
 *                 format: date
 *               sexe:
 *                 type: string
 *     responses:
 *       201:
 *         description: Profil créé avec succès
 *       400:
 *         description: Erreur de validation
 *       500:
 *         description: Erreur serveur
 */
router.post('/create', profilValidators.create, (req, res, next) => profilController.createProfil(req, res, next));

/**
 * @swagger
 * /api/profil/update/{id_profil}:
 *   put:
 *     summary: Mettre à jour un profil
 *     tags: [Profil]
 *     parameters:
 *       - in: path
 *         name: id_profil
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
 *               prenom:
 *                 type: string
 *               date_naissance:
 *                 type: string
 *                 format: date
 *               sexe:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profil mis à jour avec succès
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Profil non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put('/update/:id_profil', profilValidators.update, (req, res, next) => profilController.updateProfil(req, res, next));

/**
 * @swagger
 * /api/profil/delete/{id_profil}:
 *   delete:
 *     summary: Supprimer un profil
 *     tags: [Profil]
 *     parameters:
 *       - in: path
 *         name: id_profil
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Profil supprimé avec succès
 *       404:
 *         description: Profil non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete('/delete/:id_profil',profilValidators.delete, (req, res, next) => profilController.deleteProfil(req, res, next));

/**
 * @swagger
 * /api/profil/getProfil/{id}:
 *   get:
 *     summary: Récupérer un profil par son ID
 *     tags: [Profil]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Profil trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_profil:
 *                   type: integer
 *                 id_utilisateur:
 *                   type: integer
 *                 nom:
 *                   type: string
 *                 prenom:
 *                   type: string
 *                 date_naissance:
 *                   type: string
 *                   format: date
 *                 sexe:
 *                   type: string
 *       404:
 *         description: Profil non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/getProfil/:id', (req, res, next) => profilController.getProfilById(req, res, next));

/**
 * @swagger
 * /api/profil/getProfilByUser/{id}:
 *   get:
 *     summary: Récupérer un profil par l'ID de l'utilisateur
 *     tags: [Profil]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Profil trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_profil:
 *                   type: integer
 *                 id_utilisateur:
 *                   type: integer
 *                 nom:
 *                   type: string
 *                 prenom:
 *                   type: string
 *                 date_naissance:
 *                   type: string
 *                   format: date
 *                 sexe:
 *                   type: string
 *       404:
 *         description: Profil non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/getProfilByUser/:id', (req, res, next) => profilController.getProfilByUserId(req, res, next));
module.exports = router;