require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const seedIfEmpty = require("./seed/seedListings");
const registerChatSocket = require("./socket/chatSocket");
const { startAlertScheduler } = require("./services/alertScheduler");

const authRoutes = require("./routes/authRoutes");
const listingRoutes = require("./routes/listingRoutes");
const chatRoutes = require("./routes/chatRoutes");
const calculationRoutes = require("./routes/calculationRoutes");
const agentRoutes = require("./routes/agentRoutes");
const savedSearchRoutes = require("./routes/savedSearchRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());

// IMPORTANT: Stripe's webhook needs the raw request body to verify its
// signature, so this has to be mounted with express.raw() BEFORE the global
// express.json() parser below -- otherwise the body would already be
// parsed into an object by the time paymentRoutes/webhook sees it and
// signature verification would fail.
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Nestly API is running" });
});

app.use("/api/login", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/messages", chatRoutes);
app.use("/api/calculations", calculationRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/saved-searches", savedSearchRoutes);
app.use("/api/payments", paymentRoutes);

registerChatSocket(io);

const PORT = process.env.PORT || 4000;

connectDB()
  .then(seedIfEmpty)
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Nestly server running at http://localhost:${PORT}`);
      startAlertScheduler();
    });
  })
  .catch((error) => {
    console.log("Could not start the server.");
    console.log("Make sure MongoDB is running (Compass alone is just the viewer).");
    console.log("Error:", error.message);
  });
