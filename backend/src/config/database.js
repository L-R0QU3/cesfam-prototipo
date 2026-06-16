const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  client_encoding: 'utf8',
});

// Agrega un evento 'connect' para ejecutar SET client_encoding
pool.on('connect', (client) => {
  client.query('SET client_encoding = utf8', (err) => {
    if (err) console.error('Error al establecer codificación:', err);
    else console.log('✅ Codificación UTF-8 forzada en la conexión');
  });
});

pool.on('error', (err) => {
  console.error('❌ Error en pool PostgreSQL:', err.message);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  pool,
};