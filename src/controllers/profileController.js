const repo           = require('../utils/profileRepository');
const { enrichName } = require('../utils/enrichment');

function isValidUUID(str) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

function toUTCISO(date) {
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

function formatFull(row) {
  return {
    id:                  row.id,
    name:                row.name,
    gender:              row.gender,
    gender_probability:  parseFloat(row.gender_probability),
    sample_size:         row.sample_size,
    age:                 row.age,
    age_group:           row.age_group,
    country_id:          row.country_id,
    country_probability: parseFloat(row.country_probability),
    created_at:          toUTCISO(row.created_at),
  };
}

function formatList(row) {
  return {
    id:         row.id,
    name:       row.name,
    gender:     row.gender,
    age:        row.age,
    age_group:  row.age_group,
    country_id: row.country_id,
  };
}

// POST /api/profiles
async function createProfile(req, res, next) {
  try {
    const { name } = req.body;

    if (name === undefined || name === null) {
      return res.status(400).json({ status: 'error', message: 'name is required' });
    }
    if (typeof name !== 'string') {
      return res.status(422).json({ status: 'error', message: 'name must be a string' });
    }
    if (name.trim() === '') {
      return res.status(400).json({ status: 'error', message: 'name must not be empty' });
    }

    // Idempotency check
    const existing = await repo.findByName(name);
    if (existing) {
      return res.status(200).json({
        status:  'success',
        message: 'Profile already exists',
        data:    formatFull(existing),
      });
    }

    // Hit all 3 external APIs
    const enriched = await enrichName(name);

    // Save to DB
    const profile = await repo.create(name, enriched);

    return res.status(201).json({
      status: 'success',
      data:   formatFull(profile),
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/profiles
async function listProfiles(req, res, next) {
  try {
    const { gender, country_id, age_group } = req.query;
    const rows = await repo.list({ gender, country_id, age_group });

    return res.status(200).json({
      status: 'success',
      count:  rows.length,
      data:   rows.map(formatList),
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/profiles/:id
async function getProfileById(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ status: 'error', message: 'Invalid id format' });
    }

    const profile = await repo.findById(id);
    if (!profile) {
      return res.status(404).json({ status: 'error', message: 'Profile not found' });
    }

    return res.status(200).json({ status: 'success', data: formatFull(profile) });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/profiles/:id
async function deleteProfile(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ status: 'error', message: 'Invalid id format' });
    }

    const deleted = await repo.remove(id);
    if (!deleted) {
      return res.status(404).json({ status: 'error', message: 'Profile not found' });
    }

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { createProfile, listProfiles, getProfileById, deleteProfile };