const { Pool } = require('pg');

let pool;

async function connectDB() {
  pool = new Pool({
    host:     process.env.DB_HOST     || 'localhost',
    port:     Number(process.env.DB_PORT) || 5432,
    user:     process.env.DB_USER     || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'profile_intelligence',
  });

  // Will throw immediately if credentials are wrong
  const client = await pool.connect();
  client.release();

  await createTable();
}

async function createTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";

      CREATE TABLE IF NOT EXISTS profiles (
        id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        name                VARCHAR(255) NOT NULL UNIQUE,
        gender              VARCHAR(50),
        gender_probability  NUMERIC(6,4),
        sample_size         INTEGER,
        age                 INTEGER,
        age_group           VARCHAR(20),
        country_id          VARCHAR(10),
        country_probability NUMERIC(6,4),
        created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_profiles_name
        ON profiles(LOWER(name));
      CREATE INDEX IF NOT EXISTS idx_profiles_gender
        ON profiles(LOWER(gender));
      CREATE INDEX IF NOT EXISTS idx_profiles_country_id
        ON profiles(LOWER(country_id));
      CREATE INDEX IF NOT EXISTS idx_profiles_age_group
        ON profiles(LOWER(age_group));
    `);
    console.log('✅ Table ready');
  } finally {
    client.release();
  }
}

function getPool() {
  if (!pool) throw new Error('DB not connected yet');
  return pool;
}

module.exports = { connectDB, getPool };