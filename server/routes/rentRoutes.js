const express = require('express');
const router = express.Router();
const rentController = require('../controllers/rentController');
const auth = require('../middleware/auth'); // If there is auth middleware

// Fallback if no auth middleware
router.get('/', rentController.getRents);
router.post('/', rentController.addRent);
router.delete('/:id', rentController.deleteRent);

module.exports = router;
