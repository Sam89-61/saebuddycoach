const { client } = require('../config/database');
const bcrypt = require('bcryptjs');

class InformationSante {
    static async create(infoData,dbClient) {
        const { conditions_medicales, condition_physique } = infoData;
        const query = `
       INSERT INTO information_sante (conditions_medicales, condition_physique) VALUES ($1::json, $2::json) RETURNING *
        `;
       
       const resultInfoSante = await dbClient.query(query, [
                JSON.stringify(conditions_medicales),
                JSON.stringify(condition_physique)
            ]);
        return resultInfoSante.rows[0];
    }
    static async findById(id_information_sante, dbClient) {
        const query = 'SELECT * FROM information_sante WHERE id_information_sante = $1';
        const result = await dbClient.query(query, [id_information_sante]);
        return result.rows[0];
    }
    static async update(id_information_sante, infoData, dbClient) {
        const { conditions_medicales, condition_physique } = infoData;
        const query = `
            UPDATE information_sante
            SET conditions_medicales = $1::json, condition_physique = $2::json 
            WHERE id_information_sante = $3
            RETURNING *
        `;
        const result = await dbClient.query(query, [
            JSON.stringify(conditions_medicales),
            JSON.stringify(condition_physique),
            id_information_sante
        ]);
        return result.rows[0];
    }
    static async delete(id_information_sante, dbClient) {
        const query = `
            DELETE FROM information_sante
            WHERE id_information_sante = $1
            RETURNING *
        `;
        const result = await dbClient.query(query, [id_information_sante]);
        return result.rows[0];
    }
    static async getConditionsMedicales(infoSante, dbClient) {
        const query = `
            SELECT conditions_medicales
            FROM information_sante
            WHERE id_information_sante = $1
        `;
        const result = await dbClient.query(query, [infoSante.id_information_sante]);
        return result.rows[0].conditions_medicales;
    }
    static async getConditionPhysique(infoSante, dbClient) {
        const query = `
            SELECT condition_physique
            FROM information_sante
            WHERE id_information_sante = $1
        `;
        const result = await dbClient.query(query, [infoSante.id_information_sante]);
        return result.rows[0].condition_physique;
    }
}

module.exports = InformationSante;



