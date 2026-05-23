const express = require('express');
const router = express.Router();
const ledgerController = require('../controllers/ledgerController');
const { authMiddleware } = require('../middleware/auth');

router.get('/accounts', authMiddleware, ledgerController.getLedgerAccounts);
router.put('/account/:oldName', authMiddleware, ledgerController.renameLedgerAccount);
router.delete('/account/:name', authMiddleware, ledgerController.deleteLedgerAccount);
router.get('/', authMiddleware, ledgerController.getLedger);
router.post('/', authMiddleware, ledgerController.addLedgerEntry);
router.put('/:id', authMiddleware, ledgerController.updateLedgerEntry);
router.delete('/:id', authMiddleware, ledgerController.deleteLedgerEntry);

module.exports = router;
