const bcrypt = require('bcryptjs');

class User {
    static async create(userData, client) {
        const { email, mot_de_passe, pseudo, role } = userData;
        const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
        const query = `
            INSERT INTO utilisateurs (email, password, pseudo, role)
            VALUES ($1, $2, $3, $4) RETURNING id_utilisateur as id, email, pseudo, role, date_inscription;
        `;
        const values = [email, hashedPassword, pseudo, role];
        const res = await client.query(query, values);
        return res.rows[0];
    }

    static async findByEmail(identifier, client) {
        // Recherche par email OU pseudo
        const query = `SELECT id_utilisateur as id, email, password as mot_de_passe, pseudo, role, date_inscription FROM utilisateurs WHERE email = $1 OR pseudo = $1`;
        const values = [identifier];
        const res = await client.query(query, values);
        return res.rows[0];
    }

    static async findById(id, client) {
        const query = `SELECT id_utilisateur as id, email, pseudo, role, date_inscription FROM utilisateurs WHERE id_utilisateur = $1`;
        const values = [id];
        const res = await client.query(query, values);
        return res.rows[0];
    }

    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
    static async update(id, userData, client) {
        const { email, mot_de_passe, pseudo, role } = userData;
        
        let query = 'UPDATE utilisateurs SET ';
        const values = [];
        let index = 1;

        if (email) {
            query += `email = $${index}, `;
            values.push(email);
            index++;
        }
        if (pseudo) {
            query += `pseudo = $${index}, `;
            values.push(pseudo);
            index++;
        }
        if (mot_de_passe) {
            const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
            query += `password = $${index}, `;
            values.push(hashedPassword);
            index++;
        }
        if (role) {
            query += `role = $${index}, `;
            values.push(role);
            index++;
        }

        // Remove trailing comma and space
        query = query.slice(0, -2);

        query += ` WHERE id_utilisateur = $${index} RETURNING id_utilisateur as id, email, pseudo, role, date_inscription`;
        values.push(id);

        const res = await client.query(query, values);
        return res.rows[0];
    }
    static async delete(id, client) {
        const query = `
            DELETE FROM utilisateurs
            WHERE id_utilisateur = $1
            RETURNING id_utilisateur as id, email, pseudo, role, date_inscription;
        `;
        const values = [id];
        const res = await client.query(query, values);
        return res.rows[0];
    }
}

module.exports = User;