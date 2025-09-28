const express = require('express');
const collectionController = require('../controllers/collectionController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/:id', collectionController.getCollectionById);
router.post('/', collectionController.createCollection);
router.put('/:id', collectionController.updateCollection);
router.delete('/:id', collectionController.deleteCollection);
router.get('/:id/requests', collectionController.getCollectionRequests);

module.exports = router;