const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { authMiddleware } = require('../middleware/auth');

router.get('/summary', authMiddleware, supplierController.getSuppliersSummary);
router.post('/', authMiddleware, supplierController.addSupplier);
router.put('/:id', authMiddleware, supplierController.updateSupplier);
router.delete('/:id', authMiddleware, supplierController.deleteSupplier);

router.get('/:id/ledger', authMiddleware, supplierController.getSupplierLedger);
router.post('/:id/ledger', authMiddleware, supplierController.addSupplierTransaction);
router.put('/:id/ledger/:txId', authMiddleware, supplierController.updateSupplierTransaction);
router.delete('/:id/ledger/:txId', authMiddleware, supplierController.deleteSupplierTransaction);

module.exports = router;
