const express = require('express');
const environmentController = require('../controllers/environmentController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/workspace/:workspaceId', environmentController.getWorkspaceEnvironments);
router.get('/:id', environmentController.getEnvironmentById);
router.post('/', environmentController.createEnvironment);
router.put('/:id', environmentController.updateEnvironment);
router.delete('/:id', environmentController.deleteEnvironment);
router.get('/:id/variables', environmentController.getEnvironmentVariables);

module.exports = router;