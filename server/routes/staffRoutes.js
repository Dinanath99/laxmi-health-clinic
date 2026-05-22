const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, staffController.getStaffSummary);
router.post('/', authMiddleware, staffController.addStaff);
router.get('/:id', authMiddleware, staffController.getStaffProfile);
router.put('/:id', authMiddleware, staffController.updateStaff);
router.delete('/:id', authMiddleware, staffController.deleteStaff);

// Inner payroll routes tied to staff profile
router.post('/:id/payroll', authMiddleware, staffController.addStaffPayroll);
router.put('/:id/payroll/:txId', authMiddleware, staffController.editStaffPayroll);
router.delete('/:id/payroll/:txId', authMiddleware, staffController.deleteStaffPayroll);

module.exports = router;
