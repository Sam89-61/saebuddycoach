const {pool} = require('../config/database');
class ProgrammeAlimentaire {

    static async create(programmeData, client) {
        const { nom,description,id_programme } = programmeData;
        const query = `
            INSERT INTO programme_alimentaire (nom, description, id_programme)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const values = [nom, description, id_programme];
        const result = await client.query(query, values);
        return result.rows[0];
    }
    static async findById(id_programme, client) {
        const query = 'SELECT * FROM programme_alimentaire WHERE id_programme = $1';
        const result = await client.query(query, [id_programme]);
        return result.rows[0];
    }
    static async getByIdProgrammeAli(id_programme_a, client) {
        const query = 'SELECT * FROM programme_alimentaire WHERE id_programme_a = $1';
        const result = await client.query(query, [id_programme_a]);
        return result.rows[0];
    }
    static async findAll(client) {
        const query = 'SELECT * FROM programme_alimentaire';
        const result = await client.query(query);
        return result.rows;
    }

    static async update(id_programme_a, programmeData, client) {
        const { nom,description,id_programme } = programmeData;
        const query = `
            UPDATE programme_alimentaire set nom = $1, description = $2, id_programme = $3
            WHERE id_programme_a = $4
            RETURNING *;
        `;
        const values = [nom, description, id_programme, id_programme_a];
        const result = await client.query(query, values);
        return result.rows[0];
    }
    static async delete(id_programme_a, client) {
        const query = `
            DELETE FROM programme_alimentaire
            WHERE id_programme_a = $1
            RETURNING *;
        `;
        const result = await client.query(query, [id_programme_a]);
        return result.rows[0];
}
}

module.exports = ProgrammeAlimentaire;