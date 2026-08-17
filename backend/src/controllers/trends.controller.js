
// const { getInterest, getRelatedQueries } = require('../services/trends.service');

// exports.interest = async (req, res) => {
//   try {
//     const { keyword, geo, range } = req.query;
//     const data = await getInterest(keyword, geo, range);
//     res.json(data);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
// exports.related = async (req, res) => {
//   try {
//     const { keyword, geo, range } = req.query;
//     const data = await getRelatedQueries(keyword, geo, range);
//     res.json(data);
//   } catch (err) {
//     // Related queries kabhi kabhi keyword ke liye available hi nahi hote - empty return karein, crash nahi
//     res.json({ top: [], rising: [] });
//   }
// };

const { getInterest, getRelatedQueries } = require('../services/trends.service');

exports.interest = async (req, res) => {
  try {
    const { keyword, geo, range } = req.query;
    const data = await getInterest(keyword, geo, range);
    res.json(data);
  } catch (err) {
    // FIX #6: raw err.message client ko expose nahi hota ab - sirf server
    // logs mein jata hai, client ko generic message milta hai.
    console.error('[trends.controller] interest error:', err);
    res.status(500).json({ error: 'Failed to fetch trend data.' });
  }
};

exports.related = async (req, res) => {
  try {
    const { keyword, geo, range } = req.query;
    const data = await getRelatedQueries(keyword, geo, range);
    res.json(data);
  } catch (err) {
    // Related queries kabhi kabhi keyword ke liye available hi nahi hote - empty return karein, crash nahi
    console.error('[trends.controller] related error:', err);
    res.json({ top: [], rising: [] });
  }
};