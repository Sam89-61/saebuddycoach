class CategoryEquipement {
    static async create(equipementData, dbClient) {
        const query = `
            INSERT INTO categorie_equipement (list_equipement) VALUES ($1::json) RETURNING *
        `;
        const result = await dbClient.query(query, [JSON.stringify(equipementData)]);
        return result.rows[0];
    }
    static async findById(id_categorie_equipement, dbClient) {
        const query = 'SELECT * FROM categorie_equipement WHERE id_categorie_equipement = $1';
        const result = await dbClient.query(query, [id_categorie_equipement]);
        return result.rows[0];
    }
    static async update(id_categorie_equipement, equipementData, dbClient) {
        const query = `
            UPDATE categorie_equipement
            SET list_equipement = $1::json
            WHERE id_categorie_equipement = $2
            RETURNING *
        `;
        const result = await dbClient.query(query, [JSON.stringify(equipementData), id_categorie_equipement]);
        return result.rows[0];
    }
    static async delete(id_categorie_equipement, dbClient) {
        const query = `
            DELETE FROM categorie_equipement
            WHERE id_categorie_equipement = $1
            RETURNING *
        `;
        const result = await dbClient.query(query, [id_categorie_equipement]);
        return result.rows[0];
    }
    static async findEquipementList(id_categorie_equipement, dbClient) {
        const query = 'SELECT * FROM categorie_equipement WHERE id_categorie_equipement = $1';
        const result = await dbClient.query(query, [id_categorie_equipement]);
        return result;
    }
    
}

module.exports = CategoryEquipement;