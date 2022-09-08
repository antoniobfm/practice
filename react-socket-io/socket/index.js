import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { 
  cors: {
    origin: "http://localhost:3000"
  }
 });

let onlineUsers = [];

const addNewUser = (socketId, userId) => {
  !onlineUsers.some(user => user.userId === userId) && onlineUsers.push({ userId, socketId });

  const user = { socketId, userId };

  return user;
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter(user => user.socketId !== socketId);
};

const getUser = (userId) => {
  return onlineUsers.find(user => user.userId === userId);
};

io.on("connection", (socket) => {
  console.log(socket.id);

  socket.on("disconnect", () => {
    console.log("someone left " + socket.id);
    removeUser(socket.id);
  });

  socket.on("sendNotification", ({ senderName, receiverName, type }) => {
    const user = getUser(receiverName);
    
    if (user) {
      socket.to(user.socketId).emit("getNotification", senderName);
    }
  });

  socket.on("newUser", (username) => {
    const user = addNewUser(socket.id, username);
    socket.emit("yourID", user);
    io.emit("allUsers", onlineUsers);
  })
});

httpServer.listen(3333);
