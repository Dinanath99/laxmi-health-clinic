const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, patientController.getAllPatients);
router.post('/', authMiddleware, patientController.addPatient);
router.put('/:id', authMiddleware, patientController.updatePatient);
router.delete('/:id', authMiddleware, patientController.deletePatient);

module.exports = router;
