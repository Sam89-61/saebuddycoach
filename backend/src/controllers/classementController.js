const ClassementUser = require('../models/ClassementUser');
const Classement = require('../models/Classement');
const { withTransaction, withClient } = require('../utils/controllerWrapper');

class ClassementController {
    createClassement = withTransaction(async (req, res, client) => {
        const { nom, description, type_challenge, id_exo, unite_mesure, periode, date_debut, date_fin, actif } = req.body;
        const newClassement = await Classement.create({ nom, description, type_challenge, id_exo, unite_mesure, periode, date_debut, date_fin, actif }, client);
        res.status(201).json({
            message: 'Classement créé avec succès',
            classement: newClassement
        });
    });

    updateClassement = withTransaction(async (req, res, client) => {
        const id_classement = req.params.id;
        const { nom, description, type_challenge, id_exo, unite_mesure, periode, date_debut, date_fin, actif } = req.body;
        const updatedClassement = await Classement.update(id_classement, { nom, description, type_challenge, id_exo, unite_mesure, periode, date_debut, date_fin, actif }, client);
        res.status(200).json({
            message: 'Classement mis à jour avec succès',
            classement: updatedClassement
        });
    });

    deleteClassement = withTransaction(async (req, res, client) => {
        const id_classement = req.params.id;
        const deletedClassement = await Classement.delete(id_classement, client);
        res.status(200).json({
            message: 'Classement supprimé avec succès',
            classement: deletedClassement
        });
    });

    createClassementUser = withTransaction(async (req, res, client) => {
        const { id_classement, id_utilisateur, score, url_video_preuve, statut_validation, commentaire_validation, validateur_id } = req.body;
        const classementU = await ClassementUser.create({ id_classement, id_utilisateur, score, url_video_preuve, statut_validation, commentaire_validation, validateur_id }, client);
        res.status(201).json({
            message: 'Classement utilisateur créé avec succès',
            classementUser: classementU
        });
    });

    updateClassementUser = withTransaction(async (req, res, client) => {
        const id_classement_user = req.params.id;
        const { id_classement, id_utilisateur, score, url_video_preuve, statut_validation, commentaire_validation, validateur_id } = req.body;
        const updatedClassementUser = await ClassementUser.update(id_classement_user, { id_classement, id_utilisateur, score, url_video_preuve, statut_validation, commentaire_validation, validateur_id }, client);
        res.status(200).json({
            message: 'Classement utilisateur mis à jour avec succès',
            classementUser: updatedClassementUser
        });
    });

    deleteClassementUser = withTransaction(async (req, res, client) => {
        const id_classement_user = req.params.id;
        const deletedClassementUser = await ClassementUser.delete(id_classement_user, client);
        res.status(200).json({
            message: 'Classement utilisateur supprimé avec succès',
            classementUser: deletedClassementUser
        });
    });

    getAllClassements = withClient(async (req, res, client) => {
        const classements = await Classement.getAll(client);
        res.status(200).json(classements);
    });

    // Récupérer le classement complet (Top 10 + Rang Utilisateur)
    getLeaderboard = withClient(async (req, res, client) => {
        const id_classement = req.params.id;
        const userId = req.query.userId; // ID de l'utilisateur connecté (optionnel)

        // 1. Récupérer les infos du challenge pour savoir comment trier
        const challenge = await Classement.findById(id_classement, client);
        if (!challenge) {
            return res.status(404).json({ message: "Challenge introuvable" });
        }

        // Déterminer l'ordre de tri (Logique simple basée sur le type ou par défaut)
        // Si le type est 'CHRONO', on veut le plus petit (ASC), sinon le plus grand (DESC)
        const order = challenge.type_challenge === 'CHRONO' ? 'ASC' : 'DESC';

        // 2. Récupérer le Top 10
        const leaderboard = await ClassementUser.getLeaderboard(id_classement, 10, order, client);

        // 3. Récupérer le rang de l'utilisateur s'il est connecté
        let userRank = null;
        if (userId) {
            userRank = await ClassementUser.getUserRank(id_classement, userId, order, client);
        }

        res.status(200).json({
            challenge,
            leaderboard,
            userRank
        });
    });

    // Soumettre un score (Côté Utilisateur)
    submitScore = withTransaction(async (req, res, client) => {
        const { id_classement, score, url_video_preuve } = req.body;
        // L'ID utilisateur vient du middleware d'auth (req.user)
        const id_utilisateur = req.user ? req.user.id : req.body.id_utilisateur; 

        if (!id_utilisateur) {
            return res.status(401).json({ message: "Utilisateur non identifié" });
        }

        const newEntry = await ClassementUser.create({
            id_classement,
            id_utilisateur,
            score,
            url_video_preuve,
            statut_validation: 'EN_ATTENTE', // Par défaut
            commentaire_validation: null,
            validateur_id: null
        }, client);

        res.status(201).json({
            message: 'Score soumis avec succès ! Il sera visible après validation.',
            entry: newEntry
        });
    });

    getAllByClassementId = withClient(async (req, res, client) => {
        const id_classement = req.params.id;
        const classementUsers = await ClassementUser.getAllByClassementId(id_classement, client);
        res.status(200).json(classementUsers);
    });

    getUserByClassementAndUserId = withClient(async (req, res, client) => {
        const id_classement = req.params.classementId;
        const id_utilisateur = req.params.userId;
        const classementUser = await ClassementUser.getUserByClassementAndUserId(id_classement, id_utilisateur, client);
        res.status(200).json(classementUser);
    });
}

module.exports = ClassementController;