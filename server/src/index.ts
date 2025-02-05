import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Allow frontend to connect
    methods: ["GET", "POST"],
  },
});

// Store groups and messages
const groups: { [key: string]: { name: string; messages: Array<{ user: string; text: string }> } } = {};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Join a group
  socket.on("joinGroup", (groupId: string, userName: string) => {
    socket.join(groupId);
    if (!groups[groupId]) {
      groups[groupId] = { name: groupId, messages: [] };
    }
    io.to(groupId).emit("groupData", groups[groupId]);
  });

  // Send a message to a group
  socket.on("sendMessage", (groupId: string, user: string, text: string) => {
    if (groups[groupId]) {
      groups[groupId].messages.push({ user, text });
      io.to(groupId).emit("receiveMessage", { user, text });
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});