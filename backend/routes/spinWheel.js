const router = require("express").Router();
const SpinWheel = require("../models/SpinWheel");
const User = require("../models/User");
const Config = require("../models/Config");
const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");


let io;

module.exports = (_io) => {
  io = _io;

  /* =========================================
     1. CREATE SPIN WHEEL (ADMIN ONLY)
     ========================================= */
  router.post("/create", async (req, res) => {
    try {
      const { adminId } = req.body;

      const admin = await User.findById(adminId);
      if (!admin || admin.role !== "admin") {
        return res.status(403).json({ msg: "Only admin can create wheel" });
      }

      const existingWheel = await SpinWheel.findOne({
        status: { $in: ["waiting", "active"] }
      });

      if (existingWheel) {
        return res.status(400).json({ msg: "Only one active wheel allowed" });
      }

      const wheel = await SpinWheel.create({
        entryFee: 100,
        createdBy: admin._id
      });

      res.json(wheel);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  /* =========================================
     2. JOIN SPIN WHEEL (PAY ENTRY FEE)
     ========================================= */
     router.post("/join/:wheelId", async (req, res) => {
      try {
        const { userId } = req.body;
        const { wheelId } = req.params;
    
        const wheel = await SpinWheel.findById(wheelId);
        const user = await User.findById(userId);
        const config = await Config.findOne();
    
        if (!wheel || wheel.status !== "waiting")
          return res.status(400).json({ msg: "Wheel not available" });
    
        if (user.coins < wheel.entryFee)
          return res.status(400).json({ msg: "Insufficient coins" });
    
        if (wheel.participants.includes(user._id))
          return res.status(400).json({ msg: "Already joined" });
    
        // Deduct coins
        user.coins -= wheel.entryFee;
        await user.save();
    
        // Pool distribution
        wheel.winnerPool += wheel.entryFee * config.winnerPercent / 100;
        wheel.adminPool += wheel.entryFee * config.adminPercent / 100;
        wheel.appPool += wheel.entryFee * config.appPercent / 100;
    
        wheel.participants.push(user._id);
        await wheel.save();
    
        await Transaction.create({
          user: user._id,
          amount: wheel.entryFee,
          type: "JOIN_FEE"
        });
    
        io.emit("userJoined", wheel.participants);
        res.json({ msg: "Joined successfully" });
    
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });
    

  /* =========================================
     3. START SPIN WHEEL (ADMIN / AUTO)
     ========================================= */
  router.post("/start/:wheelId", async (req, res) => {
    try {
      const { wheelId } = req.params;

      const wheel = await SpinWheel.findById(wheelId);

      if (wheel.participants.length < 3) {
        return res.status(400).json({ msg: "Minimum 3 users required" });
      }

      wheel.eliminationQueue = shuffleArray([...wheel.participants]);
      wheel.status = "active";
      await wheel.save();

      io.emit("wheelStarted");

      startElimination(wheel._id);

      res.json({ msg: "Wheel started" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get("/active", async (req, res) => {
    try {
      const wheel = await SpinWheel.findOne({
        status: { $in: ["waiting", "active"] }
      }).populate("participants", "name");
  
      if (!wheel) {
        return res.json(null); // frontend expects this
      }
  
      res.json(wheel);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  

  /* =========================================
     4. ELIMINATION PROCESS (EVERY 7 SECONDS)
     ========================================= */
  async function startElimination(wheelId) {
    const interval = setInterval(async () => {
      const wheel = await SpinWheel.findById(wheelId);

      if (!wheel || wheel.eliminationQueue.length === 0) {
        clearInterval(interval);
        return;
      }

      if (wheel.eliminationQueue.length === 1) {
        clearInterval(interval);
      
        try {
          const winnerId = wheel.eliminationQueue[0];
          const winner = await User.findById(winnerId);
          const admin = await User.findById(wheel.createdBy);
      
          // Credit coins
          winner.coins += wheel.winnerPool;
          admin.coins += wheel.adminPool;
      
          await winner.save();
          await admin.save();
      
          await Transaction.create([
            { user: winner._id, amount: wheel.winnerPool, type: "WIN_REWARD" },
            { user: admin._id, amount: wheel.adminPool, type: "ADMIN_REWARD" }
          ]);
      
          wheel.status = "completed";
          wheel.winner = winnerId;
          await wheel.save();
      
          io.emit("winnerDeclared", winner);
          return;
      
        } catch (err) {
          console.error("Winner payout failed:", err.message);
        }
      }
      

      const eliminatedUser = wheel.eliminationQueue.shift();
      await wheel.save();

      io.emit("userEliminated", eliminatedUser);
    }, 7000);
  }

  /* =========================================
     UTILITY: FAIR SHUFFLE
     ========================================= */
  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  return router;
};
