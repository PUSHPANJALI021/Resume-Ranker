const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Test connection without holding it open
pool.query('SELECT 1')
  .then(() => console.log('Database connected successfully!'))
  .catch(err => console.error('Database connection error:', err.message));

// Prevents crash when Neon wakes up and drops idle connections
pool.on('error', (err) => {
  console.error('Unexpected DB error:', err.message);
});

module.exports = pool;