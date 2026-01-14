const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { idValidator } = require('../middleware/validators'); // On réutilise le validateur d'ID

// Protection Globale : Toutes les routes admin nécessitent d'être Admin
router.use(authenticateToken, requireAdmin);

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Gestion administrative (Utilisateurs & Modération)
 */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Lister tous les utilisateurs (Admin)
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 */
router.get('/users', adminController.getAllUsers);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Supprimer (Bannir) un utilisateur
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Utilisateur supprimé
 */
router.delete('/users/:id', idValidator, adminController.deleteUser);

/**
 * @swagger
 * /api/admin/submissions:
 *   get:
 *     summary: Récupérer les soumissions en attente de validation
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Liste des soumissions en attente
 */
router.get('/submissions', adminController.getPendingSubmissions);

/**
 * @swagger
 * /api/admin/submissions/{id}:
 *   put:
 *     summary: Valider ou Refuser une soumission
 *     tags: [Admin]
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
 *               - statut
 *             properties:
 *               statut:
 *                 type: string
 *                 enum: [VALIDE, REFUSE]
 *               commentaire:
 *                 type: string
 *     responses:
 *       200:
 *         description: Statut mis à jour
 */
router.put('/submissions/:id', idValidator, adminController.updateSubmissionStatus);

module.exports = router;
