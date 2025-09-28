const express = require('express');
const requestController = require('../controllers/requestController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Requests
 *   description: Request management
 */

router.use(authenticateToken);

/**
 * @swagger
 * /api/requests/{id}:
 *   get:
 *     summary: Get request by ID
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Request ID
 *     responses:
 *       200:
 *         description: Request details retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id', requestController.getRequestById);

/**
 * @swagger
 * /api/requests:
 *   post:
 *     summary: Create a new request
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - collection_id
 *               - name
 *               - method
 *               - url
 *             properties:
 *               collection_id:
 *                 type: integer
 *                 example: 1
 *               name:
 *                 type: string
 *                 example: Get Users
 *               method:
 *                 type: string
 *                 example: GET
 *               url:
 *                 type: string
 *                 example: https://api.example.com/users
 *               body:
 *                 type: string
 *                 example: '{"key": "value"}'
 *               headers:
 *                 type: object
 *                 example: {"Content-Type": "application/json"}
 *     responses:
 *       201:
 *         description: Request created successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/', requestController.createRequest);

/**
 * @swagger
 * /api/requests/{id}:
 *   put:
 *     summary: Update request
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated Request Name
 *               method:
 *                 type: string
 *                 example: POST
 *               url:
 *                 type: string
 *                 example: https://api.example.com/users
 *               body:
 *                 type: string
 *                 example: '{"key": "value"}'
 *               headers:
 *                 type: object
 *                 example: {"Content-Type": "application/json"}
 *     responses:
 *       200:
 *         description: Request updated successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/:id', requestController.updateRequest);

/**
 * @swagger
 * /api/requests/{id}:
 *   delete:
 *     summary: Delete request
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Request ID
 *     responses:
 *       200:
 *         description: Request deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete('/:id', requestController.deleteRequest);

/**
 * @swagger
 * /api/requests/{id}/execute:
 *   post:
 *     summary: Execute a request
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Request ID
 *     responses:
 *       200:
 *         description: Request executed successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post('/:id/execute', requestController.executeRequest);

/**
 * @swagger
 * /api/requests/{id}/executions:
 *   get:
 *     summary: Get request executions
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Request ID
 *     responses:
 *       200:
 *         description: Executions retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id/executions', requestController.getRequestExecutions);

module.exports = router;