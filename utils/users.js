// users.js

const users = [];

// Join user to chat
function userJoin(id, username, room, userType) {
  const user = { id, username, room, userType };
  users.push(user);
  return user;
}

// Get current user
function getCurrentUser(id) {
  return users.find((user) => user.id === id);
}

// User leaves chat
function userLeave(id) {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

// Get room users
function getRoomUsers(room) {
  return users.filter((user) => user.room === room);
}

// Handle user type change
function handleUserTypeChange(socket) {
  socket.on('userTypeChange', ({ userId, userType, userName, userList }) => {
    const user = getCurrentUser(userId);
    if (user) {
      user.userType = userType;
      // You can perform additional actions here, such as updating the database
      console.log(`User ${user.username} (${userId}) changed userType to ${userType}`);
    }
  });
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  handleUserTypeChange,
};
