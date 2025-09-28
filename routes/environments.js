const express = require('express');
const environmentController = require('../controllers/environmentController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Environments
 *   description: Environment management
 */

router.use(authenticateToken);

/**
 * @swagger
 * /api/environments/workspace/{workspaceId}:
 *   get:
 *     summary: Get all environments for a workspace
 *     tags: [Environments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Workspace ID
 *     responses:
 *       200:
 *         description: Environments retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Access denied to workspace
 */
router.get('/workspace/:workspaceId', environmentController.getWorkspaceEnvironments);

/**
 * @swagger
 * /api/environments/{id}:
 *   get:
 *     summary: Get environment by ID
 *     tags: [Environments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Environment ID
 *     responses:
 *       200:
 *         description: Environment details retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id', environmentController.getEnvironmentById);

/**
 * @swagger
 * /api/environments:
 *   post:
 *     summary: Create a new environment
 *     tags: [Environments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workspace_id
 *               - name
 *             properties:
 *               workspace_id:
 *                 type: integer
 *                 example: 1
 *               name:
 *                 type: string
 *                 example: Staging Environment
 *               variables:
 *                 type: object
 *                 example: {"key": "value"}
 *     responses:
 *       201:
 *         description: Environment created successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/', environmentController.createEnvironment);

/**
 * @swagger
 * /api/environments/{id}:
 *   put:
 *     summary: Update environment
 *     tags: [Environments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Environment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated Environment Name
 *               variables:
 *                 type: object
 *                 example: {"key": "newValue"}
 *     responses:
 *       200:
 *         description: Environment updated successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/:id', environmentController.updateEnvironment);

/**
 * @swagger
 * /api/environments/{id}:
 *   delete:
 *     summary: Delete environment
 *     tags: [Environments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Environment ID
 *     responses:
 *       200:
 *         description: Environment deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete('/:id', environmentController.deleteEnvironment);

/**
 * @swagger
 * /api/environments/{id}/variables:
 *   get:
 *     summary: Get variables for an environment
 *     tags: [Environments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Environment ID
 *     responses:
 *       200:
 *         description: Variables retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id/variables', environmentController.getEnvironmentVariables);

module.exports = router;