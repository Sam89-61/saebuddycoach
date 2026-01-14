const { pool } = require('../config/database');

class Mascotte {
    static async create(mascotteData, client) {
        const { experience, niveau, apparence, id_utilisateur } = mascotteData;
        const query = `
            INSERT INTO mascotte (experience, niveau, apparence, date_mise_a_jour, id_utilisateur)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        // Convertir apparence en JSON string si c'est un objet
        const apparenceJson = typeof apparence === 'object' ? JSON.stringify(apparence) : apparence;
        const values = [experience, niveau, apparenceJson, new Date(), id_utilisateur];
        const result = await client.query(query, values);
        return result.rows[0];
    }

    static async findById(id_mascotte, client) {
        const query = 'SELECT * FROM mascotte WHERE id_mascotte = $1';
        const result = await client.query(query, [id_mascotte]);
        return result.rows[0];
    }

    static async update(id_mascotte, mascotteData, client) {
        const { experience, niveau, apparence, id_utilisateur } = mascotteData;
        const query = `
            UPDATE mascotte 
            SET experience = $1, niveau = $2, apparence = $3, date_mise_a_jour = $4, id_utilisateur = $5
            WHERE id_mascotte = $6
            RETURNING *;
        `;
        // Convertir apparence en JSON string si c'est un objet
        const apparenceJson = typeof apparence === 'object' ? JSON.stringify(apparence) : apparence;
        const values = [experience, niveau, apparenceJson, new Date(), id_utilisateur, id_mascotte];
        const result = await client.query(query, values);
        return result.rows[0];
    }

    static async delete(id_mascotte, client) {
        const query = `
            DELETE FROM mascotte
            WHERE id_mascotte = $1
            RETURNING *;
        `;
        const result = await client.query(query, [id_mascotte]);
        return result.rows[0];
    }

    static async findByUserId(id_utilisateur, client) {
        const query = 'SELECT * FROM mascotte WHERE id_utilisateur = $1';
        const result = await client.query(query, [id_utilisateur]);
        return result.rows;
    }
}

module.exports = Mascotte;