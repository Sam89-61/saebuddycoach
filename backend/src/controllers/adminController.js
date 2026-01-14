const { withClient, withTransaction } = require('../utils/controllerWrapper');

class AdminController {

    // 1. GESTION DES UTILISATEURS
    
    // Lister tous les utilisateurs (simplifié pour l'admin)
    getAllUsers = withClient(async (req, res, client) => {
        const query = `
            SELECT id_utilisateur, pseudo, email, role, date_inscription 
            FROM utilisateurs 
            ORDER BY date_inscription DESC
        `;
        const result = await client.query(query);
        res.status(200).json(result.rows);
    });

    // Supprimer un utilisateur (Ban)
    deleteUser = withTransaction(async (req, res, client) => {
        const { id } = req.params;
        
        // On supprime d'abord le profil lié s'il existe (cascade souvent gérée par la DB mais on assure)
        await client.query('DELETE FROM profil WHERE id_utilisateur = $1', [id]);
        
        // Suppression de l'utilisateur
        const result = await client.query('DELETE FROM utilisateurs WHERE id_utilisateur = $1 RETURNING pseudo', [id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }

        res.status(200).json({ message: `Utilisateur ${result.rows[0].pseudo} supprimé avec succès.` });
    });

    // 2. MODÉRATION / GAMIFICATION

    // Récupérer les soumissions en attente
    getPendingSubmissions = withClient(async (req, res, client) => {
        const query = `
            SELECT 
                cu.id_classement_user,
                cu.score,
                cu.url_video_preuve,
                cu.date_soumission,
                u.pseudo,
                c.nom as nom_challenge,
                c.unite_mesure
            FROM classement_user cu
            JOIN utilisateurs u ON cu.id_utilisateur = u.id_utilisateur
            JOIN classement c ON cu.id_classement = c.id_classement
            WHERE cu.statut_validation = 'EN_ATTENTE'
            ORDER BY cu.date_soumission ASC
        `;
        const result = await client.query(query);
        res.status(200).json(result.rows);
    });

    // Valider ou Rejeter une soumission
    updateSubmissionStatus = withTransaction(async (req, res, client) => {
        const { id } = req.params; // id_classement_user
        const { statut, commentaire } = req.body; // 'VALIDE' ou 'REFUSE'

        if (!['VALIDE', 'REFUSE'].includes(statut)) {
            return res.status(400).json({ message: "Statut invalide (VALIDE ou REFUSE attendu)" });
        }

        const validateur_id = req.user.id; // L'admin qui valide

        const query = `
            UPDATE classement_user
            SET statut_validation = $1, 
                commentaire_validation = $2, 
                validateur_id = $3
            WHERE id_classement_user = $4
            RETURNING *
        `;
        
        const result = await client.query(query, [statut, commentaire, validateur_id, id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Soumission introuvable" });
        }

        res.status(200).json({ 
            message: `Soumission ${statut === 'VALIDE' ? 'validée' : 'refusée'} avec succès.`,
            submission: result.rows[0] 
        });
    });
}

module.exports = new AdminController();
