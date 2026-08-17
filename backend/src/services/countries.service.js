const axios = require('axios');
const BASE_URL = 'https://countries.dev';

exports.getAll = async () => (await axios.get(`${BASE_URL}/countries`)).data;
exports.getByName = async (name) => (await axios.get(`${BASE_URL}/name/${name}`)).data;