const db = require('../db');

const workspaceController = {
  async getUserWorkspaces(req, res) {
    try {
      const workspaces = await db('Workspaces')
        .where('creator_id', req.user.id)
        .select('*')
        .orderBy('created_at', 'desc');

      // Get counts for each workspace
      const workspacesWithCounts = await Promise.all(
        workspaces.map(async (workspace) => {
          const collectionCount = await db('Collections')
            .where('workspace_id', workspace.id)
            .count('id as count')
            .first();

          const environmentCount = await db('Environments')
            .where('workspace_id', workspace.id)
            .count('id as count')
            .first();

          return {
            ...workspace,
            collection_count: parseInt(collectionCount.count),
            environment_count: parseInt(environmentCount.count)
          };
        })
      );

      res.json({
        success: true,
        workspaces: workspacesWithCounts,
        total: workspacesWithCounts.length
      });
    } catch (error) {
      console.error('Get workspaces error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch workspaces',
        message: 'Could not retrieve your workspaces'
      });
    }
  },

  async getWorkspaceById(req, res) {
    try {
      const workspace = await db('Workspaces')
        .where('id', req.params.id)
        .where('creator_id', req.user.id)
        .first();

      if (!workspace) {
        return res.status(404).json({ 
          error: 'Workspace not found',
          message: 'Workspace does not exist or you do not have access'
        });
      }

      // Get collections
      const collections = await db('Collections')
        .where('workspace_id', req.params.id)
        .select('*')
        .orderBy('created_at', 'desc');

      // Get environments
      const environments = await db('Environments')
        .where('workspace_id', req.params.id)
        .select('*')
        .orderBy('created_at', 'desc');

      // Get collection requests count
      const collectionsWithCounts = await Promise.all(
        collections.map(async (collection) => {
          const requestCount = await db('Requests')
            .where('collection_id', collection.id)
            .count('id as count')
            .first();

          return {
            ...collection,
            request_count: parseInt(requestCount.count)
          };
        })
      );

      res.json({
        success: true,
        workspace: {
          ...workspace,
          collections: collectionsWithCounts,
          environments,
          collection_count: collections.length,
          environment_count: environments.length
        }
      });
    } catch (error) {
      console.error('Get workspace error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch workspace',
        message: 'Could not retrieve workspace details'
      });
    }
  },

  async createWorkspace(req, res) {
    try {
      const { name } = req.body;
      
      if (!name || name.trim().length === 0) {
        return res.status(400).json({ 
          error: 'Workspace name required',
          message: 'Please provide a name for the workspace'
        });
      }

      const [workspaceId] = await db('Workspaces').insert({
        name: name.trim(),
        creator_id: req.user.id
      });
      
      const newWorkspace = await db('Workspaces')
        .where('id', workspaceId)
        .first();
      
      res.status(201).json({
        success: true,
        message: 'Workspace created successfully',
        workspace: newWorkspace
      });
    } catch (error) {
      console.error('Create workspace error:', error);
      res.status(500).json({ 
        error: 'Workspace creation failed',
        message: 'Could not create new workspace'
      });
    }
  },

  async updateWorkspace(req, res) {
    try {
      const { name } = req.body;
      
      if (!name || name.trim().length === 0) {
        return res.status(400).json({ 
          error: 'Workspace name required',
          message: 'Please provide a valid workspace name'
        });
      }

      const workspace = await db('Workspaces')
        .where('id', req.params.id)
        .where('creator_id', req.user.id)
        .first();

      if (!workspace) {
        return res.status(404).json({ 
          error: 'Workspace not found',
          message: 'Workspace does not exist or you do not have permission to edit it'
        });
      }

      await db('Workspaces')
        .where('id', req.params.id)
        .update({ 
          name: name.trim(),
          updated_at: new Date()
        });

      const updatedWorkspace = await db('Workspaces')
        .where('id', req.params.id)
        .first();

      res.json({
        success: true,
        message: 'Workspace updated successfully',
        workspace: updatedWorkspace
      });
    } catch (error) {
      console.error('Update workspace error:', error);
      res.status(500).json({ 
        error: 'Workspace update failed',
        message: 'Could not update workspace'
      });
    }
  },

  async deleteWorkspace(req, res) {
    try {
      const workspace = await db('Workspaces')
        .where('id', req.params.id)
        .where('creator_id', req.user.id)
        .first();

      if (!workspace) {
        return res.status(404).json({ 
          error: 'Workspace not found',
          message: 'Workspace does not exist or you do not have permission to delete it'
        });
      }

      await db('Workspaces')
        .where('id', req.params.id)
        .delete();

      res.json({
        success: true,
        message: 'Workspace deleted successfully'
      });
    } catch (error) {
      console.error('Delete workspace error:', error);
      res.status(500).json({ 
        error: 'Workspace deletion failed',
        message: 'Could not delete workspace'
      });
    }
  }
};

module.exports = workspaceController;