const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
// const createAdapter = require("@socket.io/redis-adapter").createAdapter;
// const redis = require("redis");
require("dotenv").config();
// const { createClient } = redis;
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

const botName = "MISL Bot";

// Create Redis client
// const redisClient = createClient();

// (async () => {
//   await redisClient.connect();
//   io.adapter(createAdapter(redisClient, redisClient.duplicate()));
// })();

// Run when client connects
io.on("connection", (socket) => {
  console.log(io.of("/").adapter);
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcome current user
    socket.emit(
      "message",
      formatMessage(botName,NaN, "Welcome to Hide'em & Find'em!")
    );

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName,NaN,`${user.username} has joined the chat`)
      );

    // Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Listen for chatMessage
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit("message", formatMessage(user.username,user.userType, msg));
  });

   socket.on("chatbotMessage", (msg) => {

     socket.emit(
      "message",
      formatMessage(botName,NaN, msg)
    );
  });

  // Listen for chatAnswerMessage
  socket.on("chatAnswerMessage", (ansMsg) => {
    const user = getCurrentUser(socket.id);
    if (user.userType == 'Questioner') {
      io.to(user.room).emit("ansMessage",  formatMessage(user.username,user.userType, ansMsg));
    }
  });


  socket.on("SingleuserTypeChange", (userobj, userType) => {
    const user = getCurrentUser(userobj.id);
    if (user) {
      user.userType = userType;
    }
  });

  // Listen for user type change
  socket.on("userTypeChange", (userobj, userType,userList) => {
    const user = getCurrentUser(userobj.id);
    if (user) {
      user.userType = userType;
      // Broadcast when a user connects
      // socket.broadcast
      //   .to(user.room)
      //   .emit(
      //     "message",
      //     formatMessage(botName, `${user.username} is ${user.userType}`)
      //   );
      io.to(user.room).emit(
      "message",
      formatMessage(botName,NaN, `${user.username} is ${userType}`)
    );
    // if (userType === "Questioner") {
    //   userList.forEach(otherUser => {
    //     if (otherUser.id !== user.id) {
    //       // Emit userTypeChange event for other users
    //       // socket.emit('userTypeChange', otherUser, 'Solver');
    //       // // Set userType in local storage for other users (optional)
    //       // localStorage.setItem(`userType_${otherUser.id}`, 'Solver');
    //       otherUser.userType = 'Solver';
    //     }
    //   });
    // }


      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
      // Save updated user type to Redis
      // redisClient.hSet(`user:${userId}`, "userType", userType);
    }
  });

  // Runs when client disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, NaN,`${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

const PORT = process.env.PORT || 3003;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
