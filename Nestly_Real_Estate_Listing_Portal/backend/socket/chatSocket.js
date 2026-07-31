const Message = require("../models/Message");

function registerChatSocket(io) {
  io.on("connection", (socket) => {
    console.log("chat client connected:", socket.id);

    socket.on("join room", (roomId) => {
      socket.join(roomId);
    });

    socket.on("chat message", async (data) => {
      try {
        const roomId = data.listingId || "general";

        const saved = await Message.create({
          listingId: data.listingId || null,
          name: data.name || "Buyer",
          role: data.role === "agent" ? "agent" : "buyer",
          text: data.text,
        });

        io.to(roomId).emit("chat message", {
          _id: saved._id,
          listingId: saved.listingId,
          name: saved.name,
          role: saved.role,
          text: saved.text,
          createdAt: saved.createdAt,
        });
      } catch (error) {
        console.log("could not save chat message:", error.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("chat client disconnected:", socket.id);
    });
  });
}

module.exports = registerChatSocket;
