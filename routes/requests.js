const express = require('express');
const requestController = require('../controllers/requestController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/:id', requestController.getRequestById);
router.post('/', requestController.createRequest);
router.put('/:id', requestController.updateRequest);
router.delete('/:id', requestController.deleteRequest);
router.post('/:id/execute', requestController.executeRequest);
router.get('/:id/executions', requestController.getRequestExecutions);

module.exports = router;