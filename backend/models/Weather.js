const mongoose = require('mongoose');

const weatherSchema = new mongoose.Schema({
  cityName: { type: String, required: true },
  temperature: { type: Number, required: true },
  humidity: { type: Number, required: true },
  conditions: { type: String, required: true },
});

const Weather = mongoose.model('Weather', weatherSchema);

module.exports = Weather;


