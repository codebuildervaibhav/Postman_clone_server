
const db = require('../db');

const responseController = {
  async getResponseById(req, res) {
    try {
      const response = await db('Responses').where('id', req.params.id).first();
      if (!response) {
        return res.status(404).json({ error: 'Response not found', message: 'Response does not exist' });
      }
      res.json({ success: true, response });
    } catch (error) {
      console.error('Get response error:', error);
      res.status(500).json({ error: 'Failed to fetch response', message: 'Could not retrieve response' });
    }
  },

  async deleteResponse(req, res) {
    try {
      await db('Responses').where('id', req.params.id).delete();
      res.json({ success: true, message: 'Response deleted' });
    } catch (error) {
      console.error('Delete response error:', error);
      res.status(500).json({ error: 'Response deletion failed', message: 'Could not delete response' });
    }
  }
};

module.exports = responseController;
