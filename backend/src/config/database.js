const { Pool } = require('pg');
require('dotenv').config();

// Créer un pool de connexions au lieu d'un client unique
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Configuration optionnelle du pool
    idleTimeoutMillis: 30000, // Temps avant de fermer une connexion inactive
    connectionTimeoutMillis: 2000, // Temps maximum pour établir une connexion
});

// Tester la connexion au démarrage
pool.connect()
    .then(client => {
        console.log('✅ Connecté à PostgreSQL');
        client.release();
    })
    .catch(err => console.error('❌ Erreur de connexion à la DB:', err));

pool.on('error', (err) => {
    console.error('❌ Erreur inattendue du pool PostgreSQL:', err);
});

module.exports = { pool };