const express = require('express');
const router = express.Router();
const dailyLogController = require('../controllers/dailyLogController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, dailyLogController.getDailyLogs);
router.post('/', authMiddleware, dailyLogController.addDailyLog);
router.put('/:id', authMiddleware, dailyLogController.updateDailyLog);
router.delete('/:id', authMiddleware, dailyLogController.deleteDailyLog);

module.exports = router;
