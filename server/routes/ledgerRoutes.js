const express = require('express');
const router = express.Router();
const ledgerController = require('../controllers/ledgerController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, ledgerController.getLedger);
router.post('/', authMiddleware, ledgerController.addLedgerEntry);
router.put('/:id', authMiddleware, ledgerController.updateLedgerEntry);
router.delete('/:id', authMiddleware, ledgerController.deleteLedgerEntry);

module.exports = router;
