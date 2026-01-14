const { pool } = require('../config/database');

class ModeleSeance {
    
    // Récupérer tous les modèles (Catalogue)
    static async findAll(client) {
        const query = 'SELECT * FROM modeles_seance ORDER BY id ASC';
        const result = await client.query(query);
        return result.rows;
    }

    // Récupérer un modèle par ID avec ses détails
    static async findById(id, client) {
        const query = 'SELECT * FROM modeles_seance WHERE id = $1';
        const result = await client.query(query, [id]);
        return result.rows[0];
    }

    // Récupérer les exercices d'un modèle spécifique
    static async getExosByModeleId(id_modele_seance, client) {
        const query = `
            SELECT mse.*, e.nom_exercice, e.description as description_exo, e.img as img_exo, e.url_video_exemple
            FROM modeles_seance_exos mse
            JOIN exos e ON mse.id_exo = e.id
            WHERE mse.id_modele_seance = $1
            ORDER BY mse.ordre ASC
        `;
        const result = await client.query(query, [id_modele_seance]);
        return result.rows;
    }

    // Créer un nouveau modèle (Admin)
    static async create(data, client) {
        const { nom, description, tags_zone_corps, tags_equipement, duree_minutes, difficulte, img, video_url } = data;
        const query = `
            INSERT INTO modeles_seance (nom, description, tags_zone_corps, tags_equipement, duree_minutes, difficulte, img, video_url)
            VALUES ($1, $2, $3::json, $4::json, $5, $6, $7::json, $8)
            RETURNING *
        `;
        const values = [
            nom, description, JSON.stringify(tags_zone_corps), JSON.stringify(tags_equipement), duree_minutes, difficulte, JSON.stringify(img), video_url
        ];
        const result = await client.query(query, values);
        return result.rows[0];
    }

    // Ajouter un exercice à un modèle
    static async addExo(data, client) {
        const { id_modele_seance, id_exo, ordre, series, repetitions, temps_repos_secondes, notes } = data;
        const query = `
            INSERT INTO modeles_seance_exos (id_modele_seance, id_exo, ordre, series, repetitions, temps_repos_secondes, notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        const values = [id_modele_seance, id_exo, ordre, series, repetitions, temps_repos_secondes, notes];
        const result = await client.query(query, values);
        return result.rows[0];
    }
}

module.exports = ModeleSeance;
