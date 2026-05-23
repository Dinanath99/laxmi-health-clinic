const express = require('express');
const router = express.Router();
const trashController = require('../controllers/trashController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, trashController.getTrash);
router.post('/:id/restore', authMiddleware, trashController.restoreTrashItem);
router.delete('/:id', authMiddleware, trashController.deleteTrashItem);
router.delete('/', authMiddleware, trashController.emptyTrash);

module.exports = router;
