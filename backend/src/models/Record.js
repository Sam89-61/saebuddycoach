const { pool } = require('../config/database');

class Record {
    static async create(recordData, client) {
        const { type_record, score, date_record, id_utilisateur, id_exo } = recordData;
        const query = `
            INSERT INTO record (type_record, score, date_record, id_utilisateur, id_exo)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const values = [type_record, score, date_record, id_utilisateur, id_exo];
        const result = await client.query(query, values);
        return result.rows[0];
    }
    static async findById(id_record, client) {
        const query = 'SELECT * FROM record WHERE id_record = $1';
        const result = await client.query(query, [id_record]);
        return result.rows[0];
    }
    static async update(id_record, recordData, client) {
        const { type_record, score, date_record, id_utilisateur, id_exo } = recordData;
        const query = `
            UPDATE record
            SET type_record = $1, score = $2, date_record = $3, id_utilisateur = $4, id_exo = $5
            WHERE id_record = $6
            RETURNING *;
        `;
        const values = [type_record, score, date_record, id_utilisateur, id_exo, id_record];
        const result = await client.query(query, values);
        return result.rows[0];
    }
    static async delete(id_record, client) {
        const query = `
            DELETE FROM record
            WHERE id_record = $1
            RETURNING *;
        `;
        const result = await client.query(query, [id_record]);
        return result.rows[0];
    }
    static async findAll(client) {
        const query = 'SELECT * FROM record';
        const result = await client.query(query);
        return result.rows;
    }
    static async getAllByUserId(id_utilisateur, client) {
        const query = 'SELECT * FROM record WHERE id_utilisateur = $1';
        const result = await client.query(query, [id_utilisateur]);
        return result.rows;
    }
    
}


module.exports = Record;