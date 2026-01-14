class ClassementUser {
    static async create(classementData, client) {
        const { id_classement, id_utilisateur, score, url_video_preuve, statut_validation, commentaire_validation, validateur_id } = classementData;
        const query = `
            INSERT INTO classement_user (id_classement, id_utilisateur, score, url_video_preuve, statut_validation, commentaire_validation, validateur_id, date_soumission)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;
        `;
        const values = [id_classement, id_utilisateur, score, url_video_preuve, statut_validation, commentaire_validation, validateur_id, new Date()];
        const result = await client.query(query, values);
        return result.rows[0];
    }
    static async findById(id_classement_user, client) {
        const query = 'SELECT * FROM classement_user WHERE id_classement_user = $1';
        const result = await client.query(query, [id_classement_user]);
        return result.rows[0];
    }
    static async update(id_classement_user, classementData, client) {
        const { id_classement, id_utilisateur, score, url_video_preuve, statut_validation, commentaire_validation, validateur_id } = classementData;
        const query = `
            UPDATE classement_user
            SET id_classement = $1, id_utilisateur = $2, score = $3, url_video_preuve = $4, statut_validation = $5, commentaire_validation = $6, validateur_id = $7, date_soumission = $8
            WHERE id_classement_user = $9
            RETURNING *
        `;
        const values = [id_classement, id_utilisateur, score, url_video_preuve, statut_validation, commentaire_validation, validateur_id, new Date(), id_classement_user];
        const result = await client.query(query, values);
        return result.rows[0];
    }

    static async delete(id_classement_user, client) {
        const query = `
            DELETE FROM classement_user
            WHERE id_classement_user = $1
            RETURNING *
        `;
        const result = await client.query(query, [id_classement_user]);
        return result.rows[0];

    }
   static async getAllByClassementId(id_classement, client) {
        const query = 'SELECT * FROM classement_user where id_classement = $1';
        const result = await client.query(query, [id_classement]);
        return result.rows;
    }
    static async getUserByClassementAndUserId(id_classement, id_utilisateur, client) {
        const query = 'SELECT * FROM classement_user where id_classement = $1 AND id_utilisateur = $2';
        const result = await client.query(query, [id_classement, id_utilisateur]);
        return result.rows[0];
    }

    /**
     * Récupère le Top X des utilisateurs pour un classement donné.
     * Ne garde que la meilleure performance VALIDÉE par utilisateur.
     * @param {number} id_classement 
     * @param {number} limit (Défaut 10)
     * @param {string} order 'DESC' (Plus haut est mieux) ou 'ASC' (Plus bas est mieux)
     * @param {object} client 
     */
    static async getLeaderboard(id_classement, limit = 10, order = 'DESC', client) {
        // Sécurisation de l'ordre de tri pour éviter les injections SQL
        const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        // La requête utilise une CTE (Common Table Expression) pour :
        // 1. Filtrer les scores VALIDES
        // 2. Classer les scores de CHAQUE utilisateur (rank_perso)
        // 3. Ne garder que le meilleur score (rank_perso = 1) pour le classement final
        const query = `
            WITH BestScores AS (
                SELECT 
                    cu.id_classement_user,
                    cu.score,
                    cu.url_video_preuve,
                    cu.date_soumission,
                    u.pseudo,
                    u.id_utilisateur,
                    ROW_NUMBER() OVER (
                        PARTITION BY cu.id_utilisateur 
                        ORDER BY cu.score ${sortOrder}
                    ) as rank_perso
                FROM classement_user cu
                JOIN utilisateurs u ON cu.id_utilisateur = u.id_utilisateur
                WHERE cu.id_classement = $1 
                  AND cu.statut_validation = 'VALIDE'
            )
            SELECT 
                id_classement_user,
                score,
                url_video_preuve,
                date_soumission,
                pseudo,
                id_utilisateur
            FROM BestScores
            WHERE rank_perso = 1
            ORDER BY score ${sortOrder}
            LIMIT $2
        `;

        const result = await client.query(query, [id_classement, limit]);
        return result.rows;
    }

    /**
     * Récupère le rang et le score d'un utilisateur spécifique.
     */
    static async getUserRank(id_classement, id_utilisateur, order = 'DESC', client) {
        const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        const query = `
            WITH BestScores AS (
                SELECT 
                    cu.score,
                    cu.id_utilisateur,
                    ROW_NUMBER() OVER (
                        PARTITION BY cu.id_utilisateur 
                        ORDER BY cu.score ${sortOrder}
                    ) as rank_perso
                FROM classement_user cu
                WHERE cu.id_classement = $1 
                  AND cu.statut_validation = 'VALIDE'
            ),
            GlobalRanks AS (
                SELECT 
                    id_utilisateur,
                    score,
                    RANK() OVER (ORDER BY score ${sortOrder}) as global_rank
                FROM BestScores
                WHERE rank_perso = 1
            )
            SELECT * FROM GlobalRanks WHERE id_utilisateur = $2
        `;

        const result = await client.query(query, [id_classement, id_utilisateur]);
        return result.rows[0];
    }
}

module.exports = ClassementUser;