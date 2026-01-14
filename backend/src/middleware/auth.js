const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    const token = authHeader && authHeader.split(' ')[1]; // Extraire juste le token
    if (!token) {
        return res.status(401).json({ message: 'Accès refusé. Token manquant.' });
    }

    try {
        // 1. Vérification cryptographique du token (Synchrone)
        const userPayload = jwt.verify(token, process.env.JWT_SECRET);

        // 2. Vérification de l'existence de l'utilisateur en BDD (Asynchrone)
        // Cela permet de rejeter un token valide si l'utilisateur a été supprimé
        const client = await pool.connect();
        try {
            const dbUser = await User.findById(userPayload.id, client);
            if (!dbUser) {
                return res.status(401).json({ message: 'Utilisateur introuvable ou supprimé.' });
            }
            
            req.user = userPayload; // On garde le payload du token (ou on pourrait mettre dbUser)
            next();
        } finally {
            client.release();
        }

    } catch (err) {
        // Erreur de token (expire, signature invalide) ou erreur DB
        console.error("Erreur Auth:", err.message);
        return res.status(403).json({ message: 'Token invalide ou session expirée.' });
    }
}

const checkApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey && apiKey === process.env.API_KEY) {
        next();
    } else {
        res.status(403).json({ message: 'Clé API invalide ou manquante.' });
    }
}

const requireAdmin = (req, res, next) => {
    // On suppose que authenticateToken a déjà tourné et rempli req.user
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Accès refusé. Droits administrateur requis.' });
    }
}

module.exports = { authenticateToken , checkApiKey, requireAdmin };