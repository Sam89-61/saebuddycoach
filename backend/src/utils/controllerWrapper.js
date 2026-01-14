const { pool } = require('../config/database');

/**
 * Encapsule un contrôleur dans une transaction SQL et gère la connexion au pool.
 * @param {Function} fn - La fonction du contrôleur à exécuter.
 * @returns {Function} - Le middleware Express.
 */
const withTransaction = (fn) => async (req, res, next) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await fn(req, res, client);
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        next(error); // Transmet l'erreur au middleware errorHandler
    } finally {
        client.release();
    }
};

/**
 * Encapsule un contrôleur simple (sans transaction) et gère la connexion au pool.
 * @param {Function} fn - La fonction du contrôleur à exécuter.
 * @returns {Function} - Le middleware Express.
 */
const withClient = (fn) => async (req, res, next) => {
    const client = await pool.connect();
    try {
        await fn(req, res, client);
    } catch (error) {
        next(error);
    } finally {
        client.release();
    }
};

module.exports = { withTransaction, withClient };