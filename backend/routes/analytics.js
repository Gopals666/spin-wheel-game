const router = require("express").Router();
const SpinWheel = require("../models/SpinWheel");

router.get("/summary", async (req, res) => {
  const totalGames = await SpinWheel.countDocuments({ status: "completed" });

  const totalRevenue = await SpinWheel.aggregate([
    { $group: { _id: null, total: { $sum: "$entryFee" } } }
  ]);

  res.json({
    totalGames,
    totalRevenue: totalRevenue[0]?.total || 0
  });
});

module.exports = router;
