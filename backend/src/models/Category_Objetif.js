class CategoryObjetif {
    static async create(categorieData, client) {
        const { nom, description } = categorieData;
        const query = `
            INSERT INTO categorie_objectif (nom, description) 
            VALUES ($1, $2)
            RETURNING *
        `;
        const values = [nom, description];
        const result = await client.query(query, values);
        return result.rows[0];

    }
    static async findByName(categorie_obj, client) {
        const query = 'SELECT * FROM categorie_objectif WHERE categorie_obj = $1';
        const result = await client.query(query, [categorie_obj]);
        return result.rows[0];
    }
    static async update(categorie_obj, categorieData, client) {
        const { nom, description } = categorieData;
        const query = `
            UPDATE categorie_objectif
            SET nom = $1, description = $2
            WHERE categorie_obj = $3
            RETURNING *
        `;
        const values = [nom, description, categorie_obj];
        const result = await client.query(query, values);
        return result.rows[0];
    }
    static async delete(categorie_obj, client) {
        const query = `
            DELETE FROM categorie_objectif
            WHERE categorie_obj = $1
            RETURNING *
        `;
        const result = await client.query(query, [categorie_obj]);
        return result.rows[0];
    }
    static async findAll(client) {
        const query = 'SELECT * FROM categorie_objectif';
        const result = await client.query(query);
        return result.rows;
    }
}

module.exports = CategoryObjetif;