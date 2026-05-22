const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');
const { authMiddleware } = require('../middleware/auth');

router.post('/', authMiddleware, billController.createBill);

module.exports = router;
