class Classement {

    static async create(classementData, client) {
        const { nom,description, type_challenge, id_exo, unite_mesure, periode, date_debut, date_fin, actif } = classementData;

        const query = `
         INSERT INTO classement (nom,description, type_challenge, id_exo, unite_mesure, periode, date_debut, date_fin, actif) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;
        `;
        const values = [nom,description, type_challenge, id_exo, unite_mesure, periode, date_debut, date_fin, actif];
        const result = await client.query(query, values);
        return result.rows[0];
    }
    static async findById(id_classement, client) {
        const query = 'SELECT * FROM classement WHERE id_classement = $1';
        const result = await client.query(query, [id_classement]);
        return result.rows[0];
    }
    static async update(id_classement, classementData, client) {
        const { nom,description, type_challenge, id_exo, unite_mesure, periode, date_debut, date_fin, actif } = classementData;
        const query = `
            UPDATE classement
            SET nom = $1,description = $2, type_challenge = $3, id_exo = $4, unite_mesure = $5, periode = $6, date_debut = $7, date_fin = $8, actif = $9
            WHERE id_classement = $10
            RETURNING *
        `;
        const values = [nom,description, type_challenge, id_exo, unite_mesure, periode, date_debut, date_fin, actif, id_classement];
        const result = await client.query(query, values);
        return result.rows[0];
    }
    static async delete(id_classement, client) {
        const query = `
            DELETE FROM classement
            WHERE id_classement = $1
            RETURNING *
        `;
        const result = await client.query(query, [id_classement]);
        return result.rows[0];
    }
    static async getAll(client) {
        const query = 'SELECT * FROM classement';
        const result = await client.query(query);
        return result.rows;
    }
}
module.exports = Classement;