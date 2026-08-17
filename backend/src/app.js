const express = require('express');
const cors = require('cors');

const playstoreRoutes = require('./routes/playstore.routes');
const trendsRoutes = require('./routes/trends.routes');
const countriesRoutes = require('./routes/countries.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/playstore', playstoreRoutes);
app.use('/api/trends', trendsRoutes);
app.use('/api/countries', countriesRoutes);

module.exports = app;