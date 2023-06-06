const mongoose = require('mongoose');

const NatureSchema = new mongoose.Schema({
  Nature: {
    type: String,
    required: true,
  },
  "Increased Stat": {
    type: String,
    required: true,
  },
});

const Nature = mongoose.model('Nature', NatureSchema);

module.exports = Nature;
