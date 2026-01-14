const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { authValidators } = require('../middleware/validators');

const authController = new AuthController();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pseudo
 *               - email
 *               - password
 *             properties:
 *               pseudo:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [utilisateur, admin]
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: Erreur de validation ou email déjà existant
 *       500:
 *         description: Erreur serveur
 */
router.post('/register', (req, res) => authController.register(req, res));
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion d'un utilisateur
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Jeton JWT pour l'authentification
 *       400:
 *         description: Erreur de validation ou utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.post('/login', (req, res) => authController.login(req, res));

/**
 * @swagger
 * /api/auth/update:
 *   put:
 *     summary: Mise à jour du profil utilisateur (Pseudo, Email, Mot de passe)
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pseudo:
 *                 type: string
 *               email:
 *                 type: string
 *               currentPassword:
 *                 type: string
 *                 description: Requis si modification du mot de passe
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profil mis à jour
 *       400:
 *         description: Erreur de validation (ex: mot de passe actuel incorrect)
 *       401:
 *         description: Non authentifié
 */
router.put('/update', authenticateToken, authValidators.updateUser, (req, res) => authController.updateUser(req, res));

/**
 * @swagger
 * /api/auth/delete:
 *   delete:
 *     summary: Suppression du compte utilisateur
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Compte supprimé avec succès
 *       401:
 *         description: Non authentifié
 */
router.delete('/delete', authenticateToken, (req, res) => authController.deleteUser(req, res));

module.exports = router;