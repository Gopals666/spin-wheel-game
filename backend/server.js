const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

mongoose.connect("mongodb://127.0.0.1:27017/spinwheel");

const app = express();
app.use(cors());
app.use(express.json());


const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use("/spin", require("./routes/spinWheel")(io));
app.use("/analytics", require("./routes/analytics"));
app.use("/admin", require("./routes/admin"));


const User = require("./models/User");

app.get("/seed", async (req, res) => {
  await User.deleteMany();

  const admin = await User.create({ name: "Admin", role: "admin" });
  const u1 = await User.create({ name: "Gopal" });
  const u2 = await User.create({ name: "Tushar" });
  const u3 = await User.create({ name: "Vishal" });

  res.json({ admin, u1, u2, u3 });
});

const Config = require("./models/Config");

app.get("/seed-config", async (req, res) => {
  await Config.deleteMany();

  const config = await Config.create({
    winnerPercent: 70,
    adminPercent: 20,
    appPercent: 10
  });

  res.json(config);
});


app.get("/reset", async (req, res) => {
    await require("./models/SpinWheel").deleteMany();
    await require("./models/User").deleteMany();
    await require("./models/Transaction").deleteMany();
    res.json({ msg: "Reset done" });
  });
  


server.listen(5000, () => {
  console.log("Server running on port 5000");
});
