const express = require('express');
const router = express.Router();
const dailyLogController = require('../controllers/dailyLogController');
const { authMiddleware } = require('../middleware/auth');

router.get('/pharmacies', authMiddleware, dailyLogController.getPharmacies);
router.put('/pharmacy/:oldName', authMiddleware, dailyLogController.renamePharmacy);
router.delete('/pharmacy/:name', authMiddleware, dailyLogController.deletePharmacy);
router.get('/', authMiddleware, dailyLogController.getDailyLogs);
router.post('/', authMiddleware, dailyLogController.addDailyLog);
router.put('/:id', authMiddleware, dailyLogController.updateDailyLog);
router.delete('/:id', authMiddleware, dailyLogController.deleteDailyLog);

module.exports = router;
