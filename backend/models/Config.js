const mongoose = require("mongoose");

const ConfigSchema = new mongoose.Schema({
  winnerPercent: { type: Number, default: 70 },
  adminPercent: { type: Number, default: 20 },
  appPercent: { type: Number, default: 10 }
});

module.exports = mongoose.model("Config", ConfigSchema);
