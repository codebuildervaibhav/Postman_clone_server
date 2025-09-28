const express = require('express');
const workspaceController = require('../controllers/workspaceController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/my-workspaces', workspaceController.getUserWorkspaces);
router.get('/:id', workspaceController.getWorkspaceById);
router.post('/', workspaceController.createWorkspace);
router.put('/:id', workspaceController.updateWorkspace);
router.delete('/:id', workspaceController.deleteWorkspace);

module.exports = router;