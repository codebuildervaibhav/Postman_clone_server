const express = require('express');
const variableController = require('../controllers/variableController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.post('/', variableController.createVariable);
router.put('/:id', variableController.updateVariable);
router.delete('/:id', variableController.deleteVariable);
router.get('/owner/:ownerType/:ownerId', variableController.getOwnerVariables);

module.exports = router;