const { pool } = require('../config/database');

class SessionRepasPlat {
    static async create(sessionRepasPlatData, client) {
        const { id_session_repas, id_entree, id_plat, id_dessert, ordre, quantite, notes } = sessionRepasPlatData;
        const query = `
            INSERT INTO session_repas_plats (id_session_repas, id_entree, id_plat, id_dessert, ordre, quantite, notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
        `;
        const values = [
            id_session_repas, 
            id_entree || null, 
            id_plat || null, 
            id_dessert || null, 
            ordre, 
            quantite, 
            notes
        ];
        const result = await client.query(query, values);
        return result.rows[0];
    }

    static async findById(id_session_repas_plats, client) {
        const query = 'SELECT * FROM session_repas_plats WHERE id_session_repas_plats = $1';
        const result = await client.query(query, [id_session_repas_plats]);
        return result.rows[0];
    }

    static async update(id_session_repas_plats, sessionRepasPlatData, client) {
        const { id_session_repas, id_entree, id_plat, id_dessert, ordre, quantite, notes } = sessionRepasPlatData;
        const query = `
            UPDATE session_repas_plats
            SET id_session_repas = $1, id_entree = $2, id_plat = $3, id_dessert = $4, ordre = $5, quantite = $6, notes = $7
            WHERE id_session_repas_plats = $8
            RETURNING *;
        `;
        const values = [id_session_repas, id_entree, id_plat, id_dessert, ordre, quantite, notes, id_session_repas_plats];
        const result = await client.query(query, values);
        return result.rows[0];
    }

    static async delete(id_session_repas_plats, client) {
        const query = 'DELETE FROM session_repas_plats WHERE id_session_repas_plats = $1 RETURNING *';
        const result = await client.query(query, [id_session_repas_plats]);
        return result.rows[0];
    }

    static async getPlatsBySessionRepasId(id_session_repas, client) {
        const query = `
            SELECT 
                srp.*,
                COALESCE(e.nom, p.nom, d.nom) as nom_element,
                COALESCE(e.description, p.description, d.description) as description_element,
                COALESCE(e.recette, p.recette, d.recette) as recette,
                COALESCE(e.calorie, p.calorie, d.calorie) as calories,
                COALESCE(e.proteine, p.proteine, d.proteine) as proteine,
                COALESCE(e.glucide, p.glucide, d.glucide) as glucide,
                COALESCE(e.lipide, p.lipide, d.lipide) as lipide,
                CASE 
                    WHEN srp.id_entree IS NOT NULL THEN 'Entree'
                    WHEN srp.id_plat IS NOT NULL THEN 'Plat'
                    WHEN srp.id_dessert IS NOT NULL THEN 'Dessert'
                END as type_calcule
            FROM session_repas_plats srp
            LEFT JOIN entree e ON srp.id_entree = e.id_entree
            LEFT JOIN plat p ON srp.id_plat = p.id_plat
            LEFT JOIN dessert d ON srp.id_dessert = d.id_dessert
            WHERE srp.id_session_repas = $1 
            ORDER BY srp.ordre
        `;
        const result = await client.query(query, [id_session_repas]);
        return result.rows;
    }

    static async findDetailsBySessionRepasId(id_session_repas, client) {
        const query = `
            SELECT 
                srp.id_session_repas_plats,
                srp.ordre,
                srp.quantite,
                srp.notes,
                COALESCE(e.nom, p.nom, d.nom) as nom_element,
                COALESCE(e.description, p.description, d.description) as description_element,
                COALESCE(e.recette, p.recette, d.recette) as recette,
                COALESCE(e.calorie, p.calorie, d.calorie) as calories,
                COALESCE(e.glucide, p.glucide, d.glucide) as glucide,
                COALESCE(e.proteine, p.proteine, d.proteine) as proteine,
                COALESCE(e.lipide, p.lipide, d.lipide) as lipide,
                CASE 
                    WHEN srp.id_entree IS NOT NULL THEN 'Entree'
                    WHEN srp.id_plat IS NOT NULL THEN 'Plat'
                    WHEN srp.id_dessert IS NOT NULL THEN 'Dessert'
                END as type_element
            FROM session_repas_plats srp
            LEFT JOIN entree e ON srp.id_entree = e.id_entree
            LEFT JOIN plat p ON srp.id_plat = p.id_plat
            LEFT JOIN dessert d ON srp.id_dessert = d.id_dessert
            WHERE srp.id_session_repas = $1
            ORDER BY srp.ordre ASC
        `;
        const result = await client.query(query, [id_session_repas]);
        return result.rows;
    }
}

module.exports = SessionRepasPlat;
