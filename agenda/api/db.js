// api/db.js
const { Pool } = require('pg');

// Pool instellen voor Neon:
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Zet je Neon-URL in je .env
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;