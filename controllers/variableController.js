
const db = require('../db');

const variableController = {
  async createVariable(req, res) {
    try {
      const { owner_id, owner_type, key, value } = req.body;
      if (!owner_id || !owner_type || !key) {
        return res.status(400).json({ error: 'Missing required fields', fields: { owner_id: !owner_id, owner_type: !owner_type, key: !key } });
      }
      const [varId] = await db('Variables').insert({ owner_id, owner_type, key: key.trim(), value });
      const newVar = await db('Variables').where('id', varId).first();
      res.status(201).json({ success: true, message: 'Variable created', variable: newVar });
    } catch (error) {
      console.error('Create variable error:', error);
      res.status(500).json({ error: 'Variable creation failed', message: 'Could not create variable' });
    }
  },

  async updateVariable(req, res) {
    try {
      const { key, value } = req.body;
      const updates = {};
      if (key) updates.key = key.trim();
      if (value !== undefined) updates.value = value;
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No updates provided', message: 'Provide key or value to update' });
      }
      await db('Variables').where('id', req.params.id).update(updates);
      const updatedVar = await db('Variables').where('id', req.params.id).first();
      res.json({ success: true, message: 'Variable updated', variable: updatedVar });
    } catch (error) {
      console.error('Update variable error:', error);
      res.status(500).json({ error: 'Variable update failed', message: 'Could not update variable' });
    }
  },

  async deleteVariable(req, res) {
    try {
      await db('Variables').where('id', req.params.id).delete();
      res.json({ success: true, message: 'Variable deleted' });
    } catch (error) {
      console.error('Delete variable error:', error);
      res.status(500).json({ error: 'Variable deletion failed', message: 'Could not delete variable' });
    }
  },

  async getOwnerVariables(req, res) {
    try {
      const { ownerType, ownerId } = req.params;
      const variables = await db('Variables')
        .where('owner_id', ownerId)
        .where('owner_type', ownerType)
        .select('*');
      res.json({ success: true, variables, total: variables.length });
    } catch (error) {
      console.error('Get owner variables error:', error);
      res.status(500).json({ error: 'Failed to fetch variables', message: 'Could not retrieve variables' });
    }
  }
};

module.exports = variableController;
