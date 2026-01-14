const {pool} = require('../config/database');
class SessionRepas {
    static async create(sessionData, client) {
        const dbClient = client || await pool.connect();
        try {
            const { nom, type_repas, date_repas, heure_repas, id_programme_a,notes } = sessionData;
            const query = `
                INSERT INTO session_repas (nom, type_repas, date_repas, heure_repas, id_programme_a, notes)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *;
            `;
            const values = [nom, type_repas, date_repas, heure_repas, id_programme_a,notes];
            const result = await dbClient.query(query, values);
            return result.rows[0];
        } finally {
            if (!client) {
                dbClient.release();
            }
        }
    }
    static async findById(id_session_repas, client) {
        const dbClient = client || await pool.connect();
        try {
            const query = 'SELECT * FROM session_repas WHERE id_session_repas = $1';
            const result = await dbClient.query(query, [id_session_repas]);
            return result.rows[0];
        } finally {
            if (!client) {
                dbClient.release();
            }
        }
    }
    static async update(id_session_repas, sessionData, client) {
        const dbClient = client || await pool.connect();
        try {
            const { nom, type_repas, date_repas, heure_repas, id_programme_a,notes } = sessionData;
            const query = `
                UPDATE session_repas
                SET nom = $1, type_repas = $2, date_repas = $3, heure_repas = $4, id_programme_a = $5, notes = $6
                WHERE id_session_repas = $7
                RETURNING *;
            `;
            const values = [nom, type_repas, date_repas, heure_repas, id_programme_a, notes, id_session_repas];
            const result = await dbClient.query(query, values);
            return result.rows[0];
        } finally {
            if (!client) {
                dbClient.release();
            }
        }
    }
    static async delete(id_session_repas, client) {
        const dbClient = client || await pool.connect();
        try {
            const query = `
                DELETE FROM session_repas
                WHERE id_session_repas = $1
                RETURNING *;
            `;
            const result = await dbClient.query(query, [id_session_repas]);
            return result.rows[0];
        } finally {
            if (!client) {
                dbClient.release();
            }
        }
    }

    static async findByProgrammeAlimentaireId(id_programme_a, client) {
        const dbClient = client || await pool.connect();
        try {
            const query = 'SELECT * FROM session_repas WHERE id_programme_a = $1';
            const result = await dbClient.query(query, [id_programme_a]);
            return result.rows;
        } finally {
            if (!client) {
                dbClient.release();
            }
        }
    }

    static async findAll(client) {
        const dbClient = client || await pool.connect();
        try {
            const query = 'SELECT * FROM session_repas';
            const result = await dbClient.query(query);
            return result.rows;
        } finally {
            if (!client) {
                dbClient.release();
            }
        }
    }
}


module.exports = SessionRepas;

