const {pool} = require('../config/database');
class Programme_sportif {

    static async create(programmeData,client) {
        const { nom,description,id_programme } = programmeData;
        console.log("Création du programme sportif avec les données:", programmeData);
        const query = `
            INSERT INTO programme_sportif (nom, description, id_programme)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const values = [nom, description, id_programme];
        const result = await client.query(query, values);
        return result.rows[0];
    }
    static async findById(id_programme, client) {
        const query = 'SELECT * FROM programme_sportif WHERE id_programme = $1';
        const result = await client.query(query, [id_programme]);
        return result.rows[0];
    }
    static async update(id_programme_sportif, programmeData, client) {
        const { nom,description,id_programme } = programmeData;
        const query = `
            UPDATE programme_sportif set nom = $1, description = $2, id_programme = $3
            WHERE id_programme_sportif = $4
            RETURNING *;
        `;
        const values = [nom, description, id_programme, id_programme_sportif];
        const result = await client.query(query, values);
        return result.rows[0];
    }
    static async delete(id_programme_sportif, client) {
        const query = `
            DELETE FROM programme_sportif
            WHERE id_programme_sportif = $1
            RETURNING *;
        `;
        const result = await client.query(query, [id_programme_sportif]);
        return result.rows[0];
    }
    static async findByProgrammeId(id_programme, client) {
        const query = 'SELECT * FROM programme_sportif WHERE id_programme = $1';
        const result = await client.query(query, [id_programme]);
        return result.rows[0];
    }
    static async findAll(client) {
        const query = 'SELECT * FROM programme_sportif';
        const result = await client.query(query);
        return result.rows;
    }
}


module.exports = Programme_sportif;
