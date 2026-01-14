class SessionSportExo {
    static async create(sessionExoData, client) {
        const { id_session_sport, id_exo, ordre, repetitions, series, temps_repos_secondes, notes } = sessionExoData;
        const query = `
       INSERT INTO session_sport_exos (id_session_sport, id_exo, ordre, repetitions, series, temps_repos_secondes, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
        `;
        const values = [
            id_session_sport, id_exo, ordre, repetitions, series, temps_repos_secondes, notes
        ];
        const result = await client.query(query, values);
        return result.rows[0];
    }
    static async findById(id_session_sport_exos, client) {
        const query = 'SELECT * FROM session_sport_exos WHERE id_session_sport_exos = $1';
        const result = await client.query(query, [id_session_sport_exos]);
        return result.rows[0];
    }
    static async update(id_session_sport_exos, sessionExoData, client) {
        const { id_session_sport, id_exo, ordre, repetitions, series, temps_repos_secondes, notes } = sessionExoData;
        const query = `
            UPDATE session_sport_exos
            SET id_session_sport = $1, id_exo = $2, ordre = $3, repetitions = $4, series = $5, temps_repos_secondes = $6, notes = $7
            WHERE id_session_sport_exos = $8
            RETURNING *;
        `;
        const values = [id_session_sport, id_exo, ordre, repetitions, series, temps_repos_secondes, notes, id_session_sport_exos];
        const result = await client.query(query, values);
        return result.rows[0];
    }
    static async delete(id_session_sport_exos, client) {
        const query = `
            DELETE FROM session_sport_exos
            WHERE id_session_sport_exos = $1
            RETURNING *;
        `;
        const result = await client.query(query, [id_session_sport_exos]);
        return result.rows[0];
    }
    static async findAll(client) {
        const query = 'SELECT * FROM session_sport_exos';
        const result = await client.query(query);
        return result.rows;
    }
    static async getExosBySessionSportId(id_session_sport, client) {
        const query = 'SELECT * FROM session_sport_exos WHERE id_session_sport = $1';
        const result = await client.query(query, [id_session_sport]);
        return result.rows;
    }

    static async findDetailsBySessionId(id_session_sport, client) {
        const query = `
            SELECT s.*, e.nom_exercice, e.description as description_exo, e.img, e.url_video_exemple
            FROM session_sport_exos s
            JOIN exos e ON s.id_exo = e.id
            WHERE s.id_session_sport = $1
            ORDER BY s.ordre ASC
        `;
        const result = await client.query(query, [id_session_sport]);
        return result.rows;
    }
}


module.exports = SessionSportExo;