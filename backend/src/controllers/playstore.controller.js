

const { getSuggestions, searchApps, getAppDetails } = require('../services/playstore.service');

exports.suggestions = async (req, res) => {
  try {
    const data = await getSuggestions(req.query.term, req.query.country);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.search = async (req, res) => {
  try {
    const data = await searchApps(req.query.term, req.query.country);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.appDetails = async (req, res) => {
  try {
    const { appId, country } = req.query;
    if (!appId) return res.status(400).json({ error: 'appId is required' });
    const data = await getAppDetails(appId, country);
    if (!data) return res.status(404).json({ error: 'App details not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};