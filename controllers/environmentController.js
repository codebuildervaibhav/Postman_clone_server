
const db = require('../db');

const environmentController = {
  async getWorkspaceEnvironments(req, res) {
    try {
      const environments = await db('Environments')
        .where('workspace_id', req.params.workspaceId)
        .select('*')
        .orderBy('created_at', 'desc');
      res.json({ success: true, environments, total: environments.length });
    } catch (error) {
      console.error('Get workspace environments error:', error);
      res.status(500).json({ error: 'Failed to fetch environments', message: 'Could not retrieve environments' });
    }
  },

  async getEnvironmentById(req, res) {
    try {
      const environment = await db('Environments')
        .where('id', req.params.id)
        .first();
      if (!environment) {
        return res.status(404).json({ error: 'Environment not found', message: 'Environment does not exist' });
      }
      res.json({ success: true, environment });
    } catch (error) {
      console.error('Get environment error:', error);
      res.status(500).json({ error: 'Failed to fetch environment', message: 'Could not retrieve environment' });
    }
  },

  async createEnvironment(req, res) {
    try {
      const { workspace_id, name, variables } = req.body;
      if (!workspace_id || !name) {
        return res.status(400).json({ error: 'Missing required fields', fields: { workspace_id: !workspace_id, name: !name } });
      }
      const [envId] = await db('Environments').insert({ workspace_id, name: name.trim(), variables: variables ? JSON.stringify(variables) : null });
      const newEnv = await db('Environments').where('id', envId).first();
      res.status(201).json({ success: true, message: 'Environment created', environment: newEnv });
    } catch (error) {
      console.error('Create environment error:', error);
      res.status(500).json({ error: 'Environment creation failed', message: 'Could not create environment' });
    }
  },

  async updateEnvironment(req, res) {
    try {
      const { name, variables } = req.body;
      const updates = {};
      if (name) updates.name = name.trim();
      if (variables !== undefined) updates.variables = JSON.stringify(variables);
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No updates provided', message: 'Provide name or variables to update' });
      }
      await db('Environments').where('id', req.params.id).update(updates);
      const updatedEnv = await db('Environments').where('id', req.params.id).first();
      res.json({ success: true, message: 'Environment updated', environment: updatedEnv });
    } catch (error) {
      console.error('Update environment error:', error);
      res.status(500).json({ error: 'Environment update failed', message: 'Could not update environment' });
    }
  },

  async deleteEnvironment(req, res) {
    try {
      await db('Environments').where('id', req.params.id).delete();
      res.json({ success: true, message: 'Environment deleted' });
    } catch (error) {
      console.error('Delete environment error:', error);
      res.status(500).json({ error: 'Environment deletion failed', message: 'Could not delete environment' });
    }
  },

  async getEnvironmentVariables(req, res) {
    try {
      const environment = await db('Environments').where('id', req.params.id).first();
      if (!environment) {
        return res.status(404).json({ error: 'Environment not found', message: 'Environment does not exist' });
      }
      let variables = [];
      try {
        variables = environment.variables ? JSON.parse(environment.variables) : [];
      } catch {
        variables = [];
      }
      res.json({ success: true, variables });
    } catch (error) {
      console.error('Get environment variables error:', error);
      res.status(500).json({ error: 'Failed to fetch variables', message: 'Could not retrieve environment variables' });
    }
  }
};

module.exports = environmentController;
