const express = require('express');
const router  = express.Router();
const {
  createProfile,
  getProfileById,
  listProfiles,
  deleteProfile,
} = require('../controllers/profileController');

router.post('/',      createProfile);
router.get('/',       listProfiles);
router.get('/:id',    getProfileById);
router.delete('/:id', deleteProfile);

module.exports = router;