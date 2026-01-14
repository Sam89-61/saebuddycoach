const {client} = require('../config/database');
const bcrypt = require('bcryptjs');

class RegimeAlimentaire {
    static async create(regimeData, dbClient) {
        const { regime_alimentaire, restrictions_alimentaires } = regimeData;
        const query = `
            INSERT INTO regime_alimentaire (alimentation, restrictions_alimentaires) VALUES ($1, $2::json) RETURNING *`;
        console.log(regimeData);
            const result = await dbClient.query(query, [
            regime_alimentaire,
            JSON.stringify(restrictions_alimentaires)
        ]);
        return result.rows[0];
        
        
    }
    static async update(regime_id, regimeData, dbClient) {
        const { regime_alimentaire, restrictions_alimentaires } = regimeData;
        const query = `
            UPDATE regime_alimentaire
            SET alimentation = $1, restrictions_alimentaires = $2::json
            WHERE id_regime = $3
            RETURNING *
        `;
        const result = await dbClient.query(query, [
            regime_alimentaire,
            JSON.stringify(restrictions_alimentaires),
            regime_id
        ]);
        return result.rows[0];
    }

    static async findById(id_regime, dbClient) {
        const query = 'SELECT * FROM regime_alimentaire WHERE id_regime = $1';
        const result = await dbClient.query(query, [id_regime]);
        return result.rows[0];
    }

    static async delete(id_regime, dbClient) {
        const query = `
            DELETE FROM regime_alimentaire
            WHERE id_regime = $1
            RETURNING *
        `;
        const result = await dbClient.query(query, [id_regime]);
        return result.rows[0];
    }
}

module.exports = RegimeAlimentaire;