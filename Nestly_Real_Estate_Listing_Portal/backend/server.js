require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const seedIfEmpty = require("./seed/seedListings");
const registerChatSocket = require("./socket/chatSocket");

const authRoutes = require("./routes/authRoutes");
const listingRoutes = require("./routes/listingRoutes");
const chatRoutes = require("./routes/chatRoutes");
const calculationRoutes = require("./routes/calculationRoutes");
const agentRoutes = require("./routes/agentRoutes");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Nestly API is running" });
});

app.use("/api/login", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/messages", chatRoutes);
app.use("/api/calculations", calculationRoutes);
app.use("/api/agents", agentRoutes);

registerChatSocket(io);

const PORT = process.env.PORT || 4000;

connectDB()
  .then(seedIfEmpty)
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Nestly server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Could not start the server.");
    console.log("Make sure MongoDB is running (Compass alone is just the viewer).");
    console.log("Error:", error.message);
  });
