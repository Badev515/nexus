const { getAll, getByName } = require('../services/countries.service');

exports.all = async (req, res) => {
  try {
    res.json(await getAll());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.byName = async (req, res) => {
  try {
    res.json(await getByName(req.params.name));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};