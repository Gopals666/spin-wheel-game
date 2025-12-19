const mongoose = require("mongoose");

const SpinWheelSchema = new mongoose.Schema({
  entryFee: { type: Number, default: 100 },

  status: {
    type: String,
    enum: ["waiting", "active", "completed", "aborted"],
    default: "waiting"
  },

  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  eliminationQueue: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  winner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  winnerPool: { type: Number, default: 0 },
  adminPool: { type: Number, default: 0 },
  appPool: { type: Number, default: 0 }

}, { timestamps: true });

module.exports = mongoose.model("SpinWheel", SpinWheelSchema);
