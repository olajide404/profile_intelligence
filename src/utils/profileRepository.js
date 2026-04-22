const { getPool } = require('../db');
const { uuidv7 }  = require('./uuidv7');

const FILTERS = ['gender', 'country_id', 'age_group'];

async function findByName(name) {
  const { rows } = await getPool().query(
    `SELECT * FROM profiles WHERE LOWER(name) = LOWER($1) LIMIT 1`,
    [name.trim()]
  );
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await getPool().query(
    `SELECT * FROM profiles WHERE id = $1 LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function create(name, data) {
  const id = uuidv7();
  const { rows } = await getPool().query(
    `INSERT INTO profiles
      (id, name, gender, gender_probability, sample_size,
       age, age_group, country_id, country_probability, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, NOW() AT TIME ZONE 'UTC')
     RETURNING *`,
    [
      id,
      name.trim().toLowerCase(),
      data.gender,
      data.gender_probability,
      data.sample_size,
      data.age,
      data.age_group,
      data.country_id,
      data.country_probability,
    ]
  );
  return rows[0];
}

async function list(filters = {}) {
  const conditions = [];
  const values     = [];
  let   i          = 1;

  for (const field of FILTERS) {
    const val = filters[field];
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      conditions.push(`LOWER(${field}) = LOWER($${i})`);
      values.push(String(val).trim());
      i++;
    }
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows } = await getPool().query(
    `SELECT id, name, gender, age, age_group, country_id
     FROM profiles ${where}
     ORDER BY created_at DESC`,
    values
  );
  return rows;
}

async function remove(id) {
  const { rowCount } = await getPool().query(
    `DELETE FROM profiles WHERE id = $1`,
    [id]
  );
  return rowCount > 0;
}

module.exports = { findByName, findById, create, list, remove };