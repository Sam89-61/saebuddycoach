class Participation {
    static async create(participationData, client) {
        const { id_evenement, id_utilisateur, statut } = participationData;
        const query = `
            INSERT INTO participation (id_evenement, id_utilisateur, statut)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const values = [id_evenement, id_utilisateur, statut];
        const result = await client.query(query, values);
        return result.rows[0];

    }

    static async update(id_evenement, id_utilisateur, participationData, client) {
        const { statut } = participationData;
        const query = `
            UPDATE participation set statut = $1 
            WHERE id_evenement = $2 AND id_utilisateur = $3
            RETURNING *;
        `;
        const values = [statut, id_evenement, id_utilisateur];
        const result = await client.query(query, values);
        return result.rows[0];
    }
    static async delete(id_evenement, id_utilisateur, client) {
        const query = `
            DELETE FROM participation
            WHERE id_evenement = $1 AND id_utilisateur = $2
            RETURNING *;
        `;
        const values = [id_evenement, id_utilisateur];
        const result = await client.query(query, values);
        return result.rows[0];
    }

    static async findById(id_evenement, id_utilisateur, client) {
        const query = 'SELECT * FROM participation WHERE id_evenement = $1 AND id_utilisateur = $2';
        const values = [id_evenement, id_utilisateur];
        const result = await client.query(query, values);
        return result.rows[0];
    }
    static async findAllByUserId(id_utilisateur, client) {
        const query = 'SELECT * FROM participation WHERE id_utilisateur = $1';
        const values = [id_utilisateur];
        const result = await client.query(query, values);
        return result.rows;
    }
}

module.exports = Participation;