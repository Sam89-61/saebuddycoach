const { client } = require('../config/database');
const bcrypt = require('bcryptjs');

class Objectif {

    static async create(objectifData, dbClient) {
        const { categorie_objectif, date_fin } = objectifData;
        let description = "";
        if (categorie_objectif === "Prise de masse") {
             description = "Gagner de la masse musculaire de manière saine et progressive.";
        }else if (categorie_objectif === "Perte de poids") {
             description = "Réduire le poids corporel tout en maintenant une bonne santé.";
        } else if (categorie_objectif === "Endurance") {
             description = "Améliorer l'endurance cardiovasculaire et la capacité pulmonaire.";
        }

        const query = `
            INSERT INTO objectif (description, categorie_obj, actif, date_debut, date_fin) 
            VALUES ($1, $2, 
                true, CURRENT_DATE, $3)
            RETURNING *;
        `;
        const date_f=new Date()
        date_f.setDate(date_f.getDate() + parseInt(date_fin));
        const values = [description, categorie_objectif, date_f];
        const result = await dbClient.query(query, values);
        return result.rows[0];
    }
    static async update(id_objectif, objectifData, dbClient) {
        const { categorie_objectif, date_fin } = objectifData;
        let description = "";
        if (categorie_objectif === "Prise de masse") {
             description = "Gagner de la masse musculaire de manière saine et progressive.";
        }else if (categorie_objectif === "Perte de poids") {
             description = "Réduire le poids corporel tout en maintenant une bonne santé.";
        } else if (categorie_objectif === "Endurance") {
             description = "Améliorer l'endurance cardiovasculaire et la capacité pulmonaire.";
        }
        let date_debut= await dbClient.query('SELECT date_debut FROM objectif WHERE id_objectif = $1', [id_objectif]);
        
        if (!date_debut.rows || date_debut.rows.length === 0) {
            throw new Error(`Objectif with id ${id_objectif} not found`);
        }
        
        let date_f=date_debut.rows[0].date_debut;
        date_f.setDate(date_f.getDate() + parseInt(date_fin));
        const query = `
            UPDATE objectif
            SET description = $1, categorie_obj = $2, date_fin = $3
            WHERE id_objectif = $4
            RETURNING *
        `;
        const values = [description, categorie_objectif, date_f, id_objectif];
        const result = await dbClient.query(query, values);
        return result.rows[0];
    }
    static async delete(id_objectif, dbClient) {
        const query = `
            DELETE FROM objectif
            WHERE id_objectif = $1
            RETURNING *
        `;
        const result = await dbClient.query(query, [id_objectif]);
        return result.rows[0];
    }
    static async findByProfilId(profilId, dbClient) {
        const query = `
            SELECT o.* FROM objectif o
            JOIN profil p ON p.objectif_id = o.id_objectif
            WHERE p.id_profil = $1
        `;
        const result = await dbClient.query(query, [profilId]);
        return result.rows[0];
    }
}


module.exports = Objectif;
