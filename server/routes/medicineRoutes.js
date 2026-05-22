const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, medicineController.getAllMedicines);
router.post('/', authMiddleware, medicineController.addMedicine);
router.put('/:id', authMiddleware, medicineController.updateMedicine);
router.delete('/:id', authMiddleware, medicineController.deleteMedicine);

module.exports = router;
