const { pool } = require('../config/database');

class Exos {
    static async create(exosData, client) {
        const { nom, description, difficulte, muscle_cibles, video_tutoriel, img, id_equipement } = exosData;

        const query = `
       INSERT INTO exos (nom_exercice, description,difficulte,muscle_cibles,url_video_exemple,img::json,id_equipement)
        VALUES ($1, $2, $3, $4::json, $5, $6, $7) RETURNING *
        `;
        const values = [
            nom, description, difficulte, JSON.stringify(muscle_cibles), video_tutoriel, JSON.stringify(img), id_equipement
        ];
        const result = await client.query(query, values);
        return result.rows[0];
    }
    static async findById(id_exo, client) {
        const query = 'SELECT * FROM exos WHERE id_exo = $1';
        const result = await client.query(query, [id_exo]);
        return result.rows[0];
    }
    static async update(id_exo, exosData, client) {
        const { nom, description, difficulte, muscle_cibles, video_tutoriel,img, id_equipement } = exosData;
        const query = `
        UPDATE exos 
        SET nom_exercice = $1, description = $2, difficulte = $3, muscle_cibles = $4::json, url_video_exemple = $5, img = $6::json, id_equipement = $7
        WHERE id = $8
        RETURNING *
        `;
        const values = [nom, description, difficulte, JSON.stringify(muscle_cibles), video_tutoriel, JSON.stringify(img), id_equipement, id_exo];
        const result = await client.query(query, values);
        return result.rows[0];
    }
    static async delete(id_exo, client) {
        const query = `
        DELETE FROM exos
        WHERE id = $1
        RETURNING *
        `;
        const result = await client.query(query, [id_exo]);
        return result.rows[0];
    }
    static async findAll(client) {
        const query = 'SELECT * FROM exos';
        const result = await client.query(query);
        return result.rows;
    }

    static async findCompatibleExo(muscle, niveau, liste_equipements_user, list_exos, client) {
        let query = "";

        // On passe la liste d'équipements de l'utilisateur comme paramètre JSON ($2)
        // PostgreSQL permet de comparer des JSONB.
        let values = [muscle, JSON.stringify(liste_equipements_user)];
        let paramCounter = 3;

        // Gestion de l'exclusion (exercices déjà faits)
        let exclusionClause = "";
        if (list_exos && list_exos.length > 0) {
            const placeholders = list_exos.map(() => `$${paramCounter++}`).join(',');
            exclusionClause = `AND e.id NOT IN (${placeholders})`; // Notez le "e.id" pour éviter l'ambiguïté
            list_exos.forEach(exo => values.push(exo.id));
        }

        // REQUÊTE CORRIGÉE
        // 1. On fait une JOIN avec la table equipementExo (eq)
        // 2. On vérifie si la liste du matériel de l'exo (eq.list_equipement) est CONTENUE (<@) dans la liste de l'user ($2)
        let baseQuery = `
            SELECT e.* FROM exos e
            JOIN equipementExo eq ON e.id_equipement = eq.id_equipement
            WHERE e.muscle_cibles::jsonb ? $1 
            AND eq.list_equipement::jsonb <@ $2::jsonb
            ${exclusionClause}
        `;

        // Ajout de la difficulté
        if (niveau === 'Avancé') {
            query = `${baseQuery} AND (e.difficulte = 'Avancé' OR e.difficulte = 'Intermédiaire' OR e.difficulte = 'Débutant') ORDER BY RANDOM() LIMIT 1`;
        }
        else if (niveau === 'Intermédiaire') {
            query = `${baseQuery} AND (e.difficulte = 'Intermédiaire' OR e.difficulte = 'Débutant') ORDER BY RANDOM() LIMIT 1`;
        }
        else {
            query = `${baseQuery} AND e.difficulte = 'Débutant' ORDER BY RANDOM() LIMIT 1`;
        }

        const result = await client.query(query, values);
        return result.rows[0];
    }
}


module.exports = Exos;