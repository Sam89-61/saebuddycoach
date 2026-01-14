class EquipementExo {
    static async create(equipementData, client) {
        const { list_equipement } = equipementData;
        const query = `
            INSERT INTO equipementExo (list_equipement)
            VALUES ($1::json)
            RETURNING *;
        `;
        const values = [JSON.stringify(list_equipement)];
        const result = await client.query(query, values);
        return result.rows[0];
    }
    static async findById(id_equipement, client) {
        const query = 'SELECT * FROM equipementExo WHERE id_equipement = $1';
        const result = await client.query(query, [id_equipement]);
        return result.rows[0];
    }
    static async update(id_equipement, equipementData, client) {
        const { list_equipement } = equipementData;
        const query = `
            UPDATE equipementExo 
            SET list_equipement = $1::json
            WHERE id_equipement = $2
            RETURNING *;
        `;
        const values = [JSON.stringify(list_equipement), id_equipement];
        const result = await client.query(query, values);
        return result.rows[0];
    }
    static async delete(id_equipement, client) {
        const query = `
            DELETE FROM equipementExo
            WHERE id_equipement = $1
            RETURNING *;
        `;
        const result = await client.query(query, [id_equipement]);
        return result.rows[0];

    }
}

module.exports = EquipementExo;