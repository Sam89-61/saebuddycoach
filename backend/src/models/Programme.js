const {pool} = require('../config/database');

class Programme{
    static async create(programmeData, client) {
        const { nom, description, date_debut, date_fin, id_profil } = programmeData;
        const query = `
            INSERT INTO programme (nom, description, date_debut, date_fin,id_profil) 
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [nom, description, date_debut, date_fin, id_profil];
        const result = await client.query(query, values);
        return result.rows[0];
    }
    static async findById(id_programme, client) {
        const query = 'SELECT * FROM programme WHERE id_programme = $1';
        const result = await client.query(query, [id_programme]);
        return result.rows[0];
    }
    static async update(id_programme, programmeData, client) {
        const { nom, description, date_debut, date_fin, id_profil } = programmeData;
        const query = `
            UPDATE programme
            SET nom = $1, description = $2, date_debut = $3, date_fin = $4, id_profil = $5
            WHERE id_programme = $6
            RETURNING *
        `;
        const values = [nom, description, date_debut, date_fin, id_profil, id_programme];
        const result = await client.query(query, values);
        return result.rows[0];
    }
    static async delete(id_programme, client) {
        const query = `
            DELETE FROM programme
            WHERE id_programme = $1
            RETURNING *
        `;
        const result = await client.query(query, [id_programme]);
        return result.rows[0];
    }
    static async findByProfilId(id_profil, client) {
        const query = 'SELECT * FROM programme WHERE id_profil = $1';
        const result = await client.query(query, [id_profil]);
        return result.rows[0]; // On suppose un seul programme actif par profil pour l'instant
    }

    static async findAll(client) {
        const query = 'SELECT * FROM programme';
        const result = await client.query(query);
        return result.rows;
    }

}



module.exports = Programme;