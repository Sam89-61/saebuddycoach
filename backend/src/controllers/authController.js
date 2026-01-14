const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { withTransaction, withClient } = require('../utils/controllerWrapper');

class AuthController {

    register = withTransaction(async (req, res, client) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            pseudo,
            email,
            mot_de_passe,
            role
        } = req.body;

        const existingUser = await User.findByEmail(email, client);
        if (existingUser) {
            return res.status(400).json({ message: 'Utilisateur déjà existant avec cet email' });
        }

        const newUser = await User.create({ pseudo, email, mot_de_passe, role }, client);
        const token = jwt.sign(
            { id: newUser.id, email: newUser.email, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        res.status(201).json({
            message: 'Utilisateur créé avec succès',
            token,
            user: { id: newUser.id, pseudo: newUser.pseudo, email: newUser.email, role: newUser.role }
        });
    });

    login = withClient(async (req, res, client) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, mot_de_passe } = req.body;
        const user = await User.findByEmail(email, client);
        if (!user) {
            return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
        }
        const isPasswordValid = await User.verifyPassword(mot_de_passe, user.mot_de_passe);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
        }
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        res.status(200).json({
            message: 'Connexion réussie',
            token,
            user: { id: user.id, email: user.email, pseudo: user.pseudo, role: user.role }
        });
    });

    updateUser = withTransaction(async (req, res, client) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.user.id;
        const { pseudo, email, currentPassword, newPassword } = req.body;

        // Fetch current user data (including password hash)
        const user = await User.findById(userId, client); // We need a findById that returns password... 
        // Wait, User.findById in User.js DOES NOT return password. 
        // We need to fetch by email to get the password, or modify findById.
        // Let's use findByEmail since email is unique and we have it from the user object or DB.
        // Actually, User.findByEmail returns password.
        
        const userWithPassword = await User.findByEmail(user.email, client); 

        if (!userWithPassword) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        const updateData = {};

        // 1. Handle Pseudo/Email Update
        if (pseudo && pseudo !== user.pseudo) {
             // Check if pseudo taken
             const existingUser = await User.findByEmail(pseudo, client);
             if (existingUser && existingUser.id !== userId) {
                 return res.status(400).json({ message: 'Ce pseudo est déjà utilisé' });
             }
             updateData.pseudo = pseudo;
        }

        if (email && email !== user.email) {
            // Check if email taken
             const existingUser = await User.findByEmail(email, client);
             if (existingUser && existingUser.id !== userId) {
                 return res.status(400).json({ message: 'Cet email est déjà utilisé' });
             }
            updateData.email = email;
        }

        // 2. Handle Password Update
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ message: 'Le mot de passe actuel est requis pour changer de mot de passe' });
            }
            const isPasswordValid = await User.verifyPassword(currentPassword, userWithPassword.mot_de_passe);
            if (!isPasswordValid) {
                return res.status(400).json({ message: 'Mot de passe actuel incorrect' });
            }
            updateData.mot_de_passe = newPassword;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(200).json({ message: 'Aucune modification détectée', user });
        }

        const updatedUser = await User.update(userId, updateData, client);
        
        res.status(200).json({
            message: 'Profil mis à jour avec succès',
            user: updatedUser
        });
    });

    deleteUser = withTransaction(async (req, res, client) => {
        const userId = req.user.id;
        await User.delete(userId, client);
        res.status(200).json({ message: 'Compte supprimé avec succès' });
    });

}
module.exports = AuthController;