const express = require('express');
const router = express.Router();
const salaryController = require('../controllers/salaryController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, salaryController.getSalaries);
router.post('/', authMiddleware, salaryController.addSalary);
router.put('/:id', authMiddleware, salaryController.updateSalary);
router.delete('/:id', authMiddleware, salaryController.deleteSalary);

module.exports = router;
