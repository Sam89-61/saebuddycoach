const { pool } = require('../config/database');

class PostureReferences {
    static async create(postureData, client) {
        const { id_exo, nom, description, score_cible, url_video_reference, points_cles } = postureData;
        const query = `
         INSERT INTO posture_reference (id_exo, nom, description, score_cible, url_video_reference, points_cles)
            VALUES ($1, $2, $3, $4, $5, $6::json) RETURNING *
        `;
        const values = [
            id_exo, nom, description, score_cible, url_video_reference, JSON.stringify(points_cles)
        ];
        const result = await client.query(query, values);
        return result.rows[0];
    }
    static async findById(id_posture_reference, client) {
        const query = 'SELECT * FROM posture_reference WHERE id_posture_reference = $1';
        const result = await client.query(query, [id_posture_reference]);
        return result.rows[0];
    }
    static async update(id_posture_reference, postureData, client) {
        const { id_exo, nom, description, score_cible, url_video_reference, points_cles } = postureData;
        const query = `
            UPDATE posture_reference SET id_exo = $1, nom = $2, description = $3, score_cible = $4, url_video_reference = $5, points_cles = $6::json
            WHERE id_posture_reference = $7
            RETURNING *;
        `;
        const values = [id_exo, nom, description, score_cible, url_video_reference, JSON.stringify(points_cles), id_posture_reference];
        const result = await client.query(query, values);
        return result.rows[0];
    }
    static async delete(id_posture_reference, client) {
        const query = `
            DELETE FROM posture_reference
            WHERE id_posture_reference = $1
            RETURNING *;
        `;
        const values = [id_posture_reference];
        const result = await client.query(query, values);
        return result.rows[0];
    }
    static async findAll(client) {
        const query = 'SELECT * FROM posture_reference';
        const result = await client.query(query);
        return result.rows;
    }
    static async findByExoId(id_exo, client) {
        const query = 'SELECT * FROM posture_reference WHERE id_exo = $1';
        const result = await client.query(query, [id_exo]);
        return result.rows;
    }
}

module.exports = PostureReferences;


/* id_posture_reference integer NOT NULL DEFAULT nextval('posture_reference_id_posture_reference_seq'::regclass),
      id_exo integer NOT NULL,
      nom character varying NOT NULL,
      description text,
      score_cible numeric,
      url_video_reference character varying,
      points_cles jsonb, */