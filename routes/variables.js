const express = require('express');
const variableController = require('../controllers/variableController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Variables
 *   description: Variable management
 */

router.use(authenticateToken);

/**
 * @swagger
 * /api/variables:
 *   post:
 *     summary: Create a new variable
 *     tags: [Variables]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - owner_id
 *               - owner_type
 *               - key
 *             properties:
 *               owner_id:
 *                 type: integer
 *                 example: 1
 *               owner_type:
 *                 type: string
 *                 example: COLLECTION
 *               key:
 *                 type: string
 *                 example: apiKey
 *               value:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       201:
 *         description: Variable created successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/', variableController.createVariable);

/**
 * @swagger
 * /api/variables/{id}:
 *   put:
 *     summary: Update variable
 *     tags: [Variables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Variable ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *                 example: updatedKey
 *               value:
 *                 type: string
 *                 example: updatedValue
 *     responses:
 *       200:
 *         description: Variable updated successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/:id', variableController.updateVariable);

/**
 * @swagger
 * /api/variables/{id}:
 *   delete:
 *     summary: Delete variable
 *     tags: [Variables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Variable ID
 *     responses:
 *       200:
 *         description: Variable deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete('/:id', variableController.deleteVariable);

/**
 * @swagger
 * /api/variables/owner/{ownerType}/{ownerId}:
 *   get:
 *     summary: Get variables for an owner
 *     tags: [Variables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *         description: Owner type (e.g., COLLECTION, ENVIRONMENT)
 *       - in: path
 *         name: ownerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Owner ID
 *     responses:
 *       200:
 *         description: Variables retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/owner/:ownerType/:ownerId', variableController.getOwnerVariables);

module.exports = router;