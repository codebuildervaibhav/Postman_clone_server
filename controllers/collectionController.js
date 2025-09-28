const db = require('../db');

const collectionController = {
  async getCollectionById(req, res) {
    try {
      const collection = await db('Collections')
        .where('id', req.params.id)
        .first();

      if (!collection) {
        return res.status(404).json({ 
          error: 'Collection not found',
          message: 'Collection does not exist'
        });
      }

      // Verify user has access to workspace
      const workspace = await db('Workspaces')
        .where('id', collection.workspace_id)
        .where('creator_id', req.user.id)
        .first();

      if (!workspace) {
        return res.status(403).json({ 
          error: 'Access denied',
          message: 'You do not have permission to access this collection'
        });
      }

      // Get requests in collection
      const requests = await db('Requests')
        .where('collection_id', req.params.id)
        .select('*')
        .orderBy('created_at', 'desc');

      // Get collection variables
      const variables = await db('Variables')
        .where('owner_id', req.params.id)
        .where('owner_type', 'COLLECTION')
        .select('*');

      // Get workspace info
      const workspaceInfo = await db('Workspaces')
        .where('id', collection.workspace_id)
        .select('id', 'name')
        .first();

      res.json({
        success: true,
        collection: {
          ...collection,
          requests,
          variables,
          workspace: workspaceInfo,
          request_count: requests.length
        }
      });
    } catch (error) {
      console.error('Get collection error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch collection',
        message: 'Could not retrieve collection details'
      });
    }
  },

  async createCollection(req, res) {
    try {
      const { workspace_id, name } = req.body;
      
      if (!workspace_id || !name) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          fields: { workspace_id: !workspace_id, name: !name }
        });
      }

      // Verify workspace exists and user owns it
      const workspace = await db('Workspaces')
        .where('id', workspace_id)
        .where('creator_id', req.user.id)
        .first();

      if (!workspace) {
        return res.status(403).json({ 
          error: 'Access denied',
          message: 'You do not have permission to add collections to this workspace'
        });
      }

      const [collectionId] = await db('Collections').insert({
        workspace_id,
        name: name.trim()
      });
      
      const newCollection = await db('Collections')
        .where('id', collectionId)
        .first();
      
      res.status(201).json({
        success: true,
        message: 'Collection created successfully',
        collection: newCollection
      });
    } catch (error) {
      console.error('Create collection error:', error);
      res.status(500).json({ 
        error: 'Collection creation failed',
        message: 'Could not create new collection'
      });
    }
  },

  async updateCollection(req, res) {
    try {
      console.log('Request body:', req.body);
      const { name } = req.body;
      
      if (!name || name.trim().length === 0) {
        return res.status(400).json({ 
          error: 'Collection name required',
          message: 'Please provide a valid collection name'
        });
      }

      const collection = await db('Collections')
        .where('id', req.params.id)
        .first();

      if (!collection) {
        return res.status(404).json({ 
          error: 'Collection not found',
          message: 'Collection does not exist'
        });
      }

      // Verify user has access
      const workspace = await db('Workspaces')
        .where('id', collection.workspace_id)
        .where('creator_id', req.user.id)
        .first();

      if (!workspace) {
        return res.status(403).json({ 
          error: 'Access denied',
          message: 'You do not have permission to edit this collection'
        });
      }

      await db('Collections')
        .where('id', req.params.id)
        .update({ 
          name: name.trim(),
          updated_at: new Date()
        });

      const updatedCollection = await db('Collections')
        .where('id', req.params.id)
        .first();

      res.json({
        success: true,
        message: 'Collection updated successfully',
        collection: updatedCollection
      });
    } catch (error) {
      console.error('Update collection error:', error);
      res.status(500).json({ 
        error: 'Collection update failed',
        message: 'Could not update collection'
      });
    }
  },

  async deleteCollection(req, res) {
    try {
      const collection = await db('Collections')
        .where('id', req.params.id)
        .first();

      if (!collection) {
        return res.status(404).json({ 
          error: 'Collection not found',
          message: 'Collection does not exist'
        });
      }

      // Verify user has access
      const workspace = await db('Workspaces')
        .where('id', collection.workspace_id)
        .where('creator_id', req.user.id)
        .first();

      if (!workspace) {
        return res.status(403).json({ 
          error: 'Access denied',
          message: 'You do not have permission to delete this collection'
        });
      }

      await db('Collections')
        .where('id', req.params.id)
        .delete();

      res.json({
        success: true,
        message: 'Collection deleted successfully'
      });
    } catch (error) {
      console.error('Delete collection error:', error);
      res.status(500).json({ 
        error: 'Collection deletion failed',
        message: 'Could not delete collection'
      });
    }
  },

  async getCollectionRequests(req, res) {
    try {
      const collection = await db('Collections')
        .where('id', req.params.id)
        .first();

      if (!collection) {
        return res.status(404).json({ 
          error: 'Collection not found',
          message: 'Collection does not exist'
        });
      }

      // Verify user has access
      const workspace = await db('Workspaces')
        .where('id', collection.workspace_id)
        .where('creator_id', req.user.id)
        .first();

      if (!workspace) {
        return res.status(403).json({ 
          error: 'Access denied',
          message: 'You do not have permission to access this collection'
        });
      }

      const requests = await db('Requests')
        .where('collection_id', req.params.id)
        .select('*')
        .orderBy('created_at', 'desc');

      res.json({
        success: true,
        requests,
        total: requests.length
      });
    } catch (error) {
      console.error('Get collection requests error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch requests',
        message: 'Could not retrieve collection requests'
      });
    }
  }
};

module.exports = collectionController;