const express = require('express');
const responseController = require('../controllers/responseController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/:id', responseController.getResponseById);
router.delete('/:id', responseController.deleteResponse);

module.exports = router;