const db = require('../db');

const requestController = {
  async getRequestById(req, res) {
    try {
      const request = await db('Requests')
        .where('id', req.params.id)
        .first();

      if (!request) {
        return res.status(404).json({ 
          error: 'Request not found',
          message: 'API request does not exist'
        });
      }

      // Get collection and verify access
      const collection = await db('Collections')
        .where('id', request.collection_id)
        .first();

      if (!collection) {
        return res.status(404).json({ 
          error: 'Collection not found',
          message: 'Parent collection does not exist'
        });
      }

      const workspace = await db('Workspaces')
        .where('id', collection.workspace_id)
        .where('creator_id', req.user.id)
        .first();

      if (!workspace) {
        return res.status(403).json({ 
          error: 'Access denied',
          message: 'You do not have permission to access this request'
        });
      }

      // Get execution history
      const executions = await db('RequestExecutions')
        .where('request_id', req.params.id)
        .where('user_id', req.user.id)
        .join('Responses', 'RequestExecutions.response_id', 'Responses.id')
        .select(
          'RequestExecutions.*',
          'Responses.status_code',
          'Responses.headers',
          'Responses.body',
          'Responses.response_time_ms',
          'Responses.created_at as response_created_at'
        )
        .orderBy('RequestExecutions.executed_at', 'desc')
        .limit(50); // Limit to last 50 executions

      res.json({
        success: true,
        request: {
          ...request,
          executions,
          execution_count: executions.length
        }
      });
    } catch (error) {
      console.error('Get request error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch request',
        message: 'Could not retrieve request details'
      });
    }
  },

  async createRequest(req, res) {
    try {
      const { collection_id, name, method, url, body, headers } = req.body;
      
      // Validation
      if (!collection_id || !name || !method || !url) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          fields: {
            collection_id: !collection_id,
            name: !name,
            method: !method,
            url: !url
          }
        });
      }

      const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
      if (!validMethods.includes(method.toUpperCase())) {
        return res.status(400).json({ 
          error: 'Invalid HTTP method',
          message: `Method must be one of: ${validMethods.join(', ')}`,
          valid_methods: validMethods
        });
      }

      // Verify collection access
      const collection = await db('Collections')
        .where('id', collection_id)
        .first();

      if (!collection) {
        return res.status(404).json({ 
          error: 'Collection not found',
          message: 'Parent collection does not exist'
        });
      }

      const workspace = await db('Workspaces')
        .where('id', collection.workspace_id)
        .where('creator_id', req.user.id)
        .first();

      if (!workspace) {
        return res.status(403).json({ 
          error: 'Access denied',
          message: 'You do not have permission to add requests to this collection'
        });
      }

      const [requestId] = await db('Requests').insert({
        collection_id,
        name: name.trim(),
        method: method.toUpperCase(),
        url: url.trim(),
        body: body || null,
        headers: headers ? JSON.stringify(headers) : null
      });
      
      const newRequest = await db('Requests')
        .where('id', requestId)
        .first();
    
      res.status(201).json({
        success: true,
        message: 'Request created successfully',
        request: newRequest
      });
    } catch (error) {
      console.error('Create request error:', error);
      res.status(500).json({ 
        error: 'Request creation failed',
        message: 'Could not create new API request'
      });
    }
  },

  async updateRequest(req, res) {
    try {
      const { name, method, url, body, headers } = req.body;
      
      const request = await db('Requests')
        .where('id', req.params.id)
        .first();

      if (!request) {
        return res.status(404).json({ 
          error: 'Request not found',
          message: 'API request does not exist'
        });
      }

      // Verify access
      const collection = await db('Collections')
        .where('id', request.collection_id)
        .first();

      const workspace = await db('Workspaces')
        .where('id', collection.workspace_id)
        .where('creator_id', req.user.id)
        .first();

      if (!workspace) {
        return res.status(403).json({ 
          error: 'Access denied',
          message: 'You do not have permission to edit this request'
        });
      }

      const updates = {};
      if (name) updates.name = name.trim();
      if (method) {
        const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
        if (!validMethods.includes(method.toUpperCase())) {
          return res.status(400).json({ 
            error: 'Invalid HTTP method',
            valid_methods: validMethods
          });
        }
        updates.method = method.toUpperCase();
      }
      if (url) updates.url = url.trim();
      if (body !== undefined) updates.body = body;
      if (headers !== undefined) updates.headers = headers ? JSON.stringify(headers) : null;

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ 
          error: 'No updates provided',
          message: 'Provide at least one field to update'
        });
      }

      await db('Requests')
        .where('id', req.params.id)
        .update(updates);

      const updatedRequest = await db('Requests')
        .where('id', req.params.id)
        .first();

      res.json({
        success: true,
        message: 'Request updated successfully',
        request: updatedRequest
      });
    } catch (error) {
      console.error('Update request error:', error);
      res.status(500).json({ 
        error: 'Request update failed',
        message: 'Could not update API request'
      });
    }
  },

  async deleteRequest(req, res) {
    try {
      const request = await db('Requests')
        .where('id', req.params.id)
        .first();

      if (!request) {
        return res.status(404).json({ 
          error: 'Request not found',
          message: 'API request does not exist'
        });
      }

      // Verify access
      const collection = await db('Collections')
        .where('id', request.collection_id)
        .first();

      const workspace = await db('Workspaces')
        .where('id', collection.workspace_id)
        .where('creator_id', req.user.id)
        .first();

      if (!workspace) {
        return res.status(403).json({ 
          error: 'Access denied',
          message: 'You do not have permission to delete this request'
        });
      }

      await db('Requests')
        .where('id', req.params.id)
        .delete();

      res.json({
        success: true,
        message: 'Request deleted successfully'
      });
    } catch (error) {
      console.error('Delete request error:', error);
      res.status(500).json({ 
        error: 'Request deletion failed',
        message: 'Could not delete API request'
      });
    }
  },

  async executeRequest(req, res) {
    try {
      const request = await db('Requests')
        .where('id', req.params.id)
        .first();

      if (!request) {
        return res.status(404).json({ 
          error: 'Request not found',
          message: 'API request does not exist'
        });
      }

      // Verify access
      const collection = await db('Collections')
        .where('id', request.collection_id)
        .first();

      const workspace = await db('Workspaces')
        .where('id', collection.workspace_id)
        .where('creator_id', req.user.id)
        .first();

      if (!workspace) {
        return res.status(403).json({ 
          error: 'Access denied',
          message: 'You do not have permission to execute this request'
        });
      }

      // TODO: Implement actual API call execution
      // For now, we'll create a mock response
      const mockResponse = {
        status_code: 200,
        headers: { 
          'Content-Type': 'application/json',
          'X-Powered-By': 'Postman-Clone'
        },
        body: JSON.stringify({
          message: 'Mock execution - Real API execution to be implemented',
          request: {
            id: request.id,
            name: request.name,
            method: request.method,
            url: request.url
          }
        }),
        response_time_ms: Math.floor(Math.random() * 200) + 50 // 50-250ms
      };

      // Save response
      const [responseId] = await db('Responses').insert(mockResponse);

      // Save execution history
      const [executionId] = await db('RequestExecutions').insert({
        user_id: req.user.id,
        request_id: req.params.id,
        response_id: responseId
      });

      const execution = await db('RequestExecutions')
        .where('id', executionId)
        .first();

      res.json({
        success: true,
        message: 'Request executed successfully',
        execution: {
          ...execution,
          response: mockResponse
        }
      });
    } catch (error) {
      console.error('Execute request error:', error);
      res.status(500).json({ 
        error: 'Request execution failed',
        message: 'Could not execute API request'
      });
    }
  },

  async getRequestExecutions(req, res) {
    try {
      const request = await db('Requests')
        .where('id', req.params.id)
        .first();

      if (!request) {
        return res.status(404).json({ 
          error: 'Request not found',
          message: 'API request does not exist'
        });
      }

      // Verify access
      const collection = await db('Collections')
        .where('id', request.collection_id)
        .first();

      const workspace = await db('Workspaces')
        .where('id', collection.workspace_id)
        .where('creator_id', req.user.id)
        .first();

      if (!workspace) {
        return res.status(403).json({ 
          error: 'Access denied',
          message: 'You do not have permission to view this request\'s history'
        });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const executions = await db('RequestExecutions')
        .where('request_id', req.params.id)
        .where('user_id', req.user.id)
        .join('Responses', 'RequestExecutions.response_id', 'Responses.id')
        .select(
          'RequestExecutions.*',
          'Responses.status_code',
          'Responses.headers',
          'Responses.body',
          'Responses.response_time_ms',
          'Responses.created_at as response_created_at'
        )
        .orderBy('RequestExecutions.executed_at', 'desc')
        .limit(limit)
        .offset(offset);

      const total = await db('RequestExecutions')
        .where('request_id', req.params.id)
        .where('user_id', req.user.id)
        .count('id as count')
        .first();

      res.json({
        success: true,
        executions,
        pagination: {
          page,
          limit,
          total: parseInt(total.count),
          pages: Math.ceil(total.count / limit)
        }
      });
    } catch (error) {
      console.error('Get executions error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch execution history',
        message: 'Could not retrieve request executions'
      });
    }
  }
};

module.exports = requestController;