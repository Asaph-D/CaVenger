const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'cavenger',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '1234',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test de connexion
pool.on('connect', () => {
    console.log('✅ Connexion à PostgreSQL établie');
});

pool.on('error', (err) => {
    console.error('❌ Erreur de connexion PostgreSQL:', err);
});

// Créer les tables si elles n'existent pas
const initDatabase = async () => {
    try {
        // Table des utilisateurs
        await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        subscription_tier VARCHAR(20) DEFAULT 'free',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Table des soumissions CV
        await pool.query(`
      CREATE TABLE IF NOT EXISTS cv_submissions (
        id SERIAL PRIMARY KEY,
        user_email VARCHAR(255) NOT NULL,
        template_id VARCHAR(50) NOT NULL,
        cv_data JSONB NOT NULL,
        pdf_path VARCHAR(500),
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Index
        await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_email ON cv_submissions(user_email);
      CREATE INDEX IF NOT EXISTS idx_status ON cv_submissions(status);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

        console.log('✅ Tables de base de données initialisées');
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
    }
};

module.exports = { pool, initDatabase };

