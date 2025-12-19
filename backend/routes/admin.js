const router = require("express").Router();
const SpinWheel = require("../models/SpinWheel");
const Transaction = require("../models/Transaction");

router.get("/dashboard", async (req, res) => {
  const activeWheel = await SpinWheel.findOne({
    status: { $in: ["waiting", "active"] }
  }).populate("participants winner", "name coins");

  const completedWheels = await SpinWheel.find({ status: "completed" })
    .sort({ createdAt: -1 })
    .limit(5);

  const totalTransactions = await Transaction.countDocuments();

  res.json({
    activeWheel,
    completedWheels,
    totalTransactions
  });
});

module.exports = router;
