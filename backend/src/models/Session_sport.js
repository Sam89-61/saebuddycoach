const {pool} = require('../config/database');
class SessionSport {

    static async create(sessionData,client) {
        const { nom, description, date_session, heure_session, duree_minutes, id_programme_sportif } = sessionData;
        const query = `
       INSERT INTO session_sport (nom, description, date_session, heure_session, duree_minutes, id_programme_sportif)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
        `;
        const values = [
            nom, description, date_session, heure_session, duree_minutes, id_programme_sportif
        ];
        const result = await client.query(query, values);
        return result.rows[0];
    }
    static async findById(id_session_sport, client) {
        const query = 'SELECT * FROM session_sport WHERE id_session_sport = $1';
        const result = await client.query(query, [id_session_sport]);
        return result.rows[0];
    }

    static async update(id_session_sport, sessionData, client) {
        const { nom, description, date_session, heure_session, duree_minutes,finish, id_programme_sportif } = sessionData;
        const query = `
         UPDATE session_sport
            SET nom = $1, description = $2, date_session = $3, heure_session = $4, duree_minutes = $5,finish = $6, id_programme_sportif = $7
            WHERE id_session_sport = $8 
            RETURNING *;
        `;
        const values = [
            nom, description, date_session, heure_session, duree_minutes,finish, id_programme_sportif, id_session_sport
        ];
        const result = await client.query(query, values);
        return result.rows[0];
    }
    static async delete(id_session_sport, client) {
        const query = `
            DELETE FROM session_sport
            WHERE id_session_sport = $1
            RETURNING *;
        `;
        const result = await client.query(query, [id_session_sport]);
        return result.rows[0];
    }
    static async findByProgrammeSportifId(id_programme_sportif, client) {
        const query = 'SELECT * FROM session_sport WHERE id_programme_sportif = $1 ORDER BY date_session ASC';
        const result = await client.query(query, [id_programme_sportif]);
        return result.rows;
    }
    static async findAll(client) {
        const query = 'SELECT * FROM session_sport';
        const result = await client.query(query);
        return result.rows;
    }

    static async markAsRealized(id_session_sport, client) {
        const query = `
            UPDATE session_sport
            SET finish = true
            WHERE id_session_sport = $1
            RETURNING *;
        `;
        const result = await client.query(query, [id_session_sport]);
        return result.rows[0];
    }
}



module.exports = SessionSport;

