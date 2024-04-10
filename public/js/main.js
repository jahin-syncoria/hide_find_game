// main.js

const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const answer = document.getElementById('answer');

// Function to get user type
function getUserType() {
  return localStorage.getItem('userType') || 'solver'; // Default to 'solver' if userType is not set
}


// fetch selected text 

function getSelectionText(){
    var selectedText = ""
    if (window.getSelection){ // all modern browsers and IE9+
        selectedText = window.getSelection().toString()
    }
    return selectedText
}

document.addEventListener('mouseup', function(){
    var thetext = getSelectionText()
    if (thetext.length > 0){ // check there's some text selected
        console.log(thetext) // logs whatever textual content the user has selected on the page
        answer.value = thetext.replace(/\s/g, '').toLowerCase();
    }
}, false)

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
const userCurrent = document.getElementById('current-user').innerText = "    " + username;
const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, room });

// Function to set user type
function setUserType(userType, userid, userName, userList) {
  //console.log(socket.id);
  socket.emit('userTypeChange',  {userid, userType, userName, userList}); // Emit userTypeChange event
  localStorage.setItem('userType', userType);
  console.log(userType);
  if(userType == 'questioner'){
    answer.hidden = false
  }else{
    answer.hidden = true
  }
}

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Message from server
socket.on('message', (message) => {
  console.log(message);
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});


// Message submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get message text
  let msg = e.target.elements.msg.value;

  msg = msg.trim();

  if (!msg) {
    return false;
  }

  // Emit message to server
  socket.emit('chatMessage', msg);

  // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
  console.log(message.username)
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = message.username;
  p.innerHTML += `<span> ${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);

  if(message.text.toLowerCase() == answer.value){
    var delayInMilliseconds = 2000; //1 second

    setTimeout(function() {
      alert("The answer is correct");
    }, delayInMilliseconds);
    
  }
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Output users to DOM
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    const selectionField = createSelectionField(user, users); // Create selection field
    li.innerText = user.username;
    console.log(user.username)
    li.appendChild(selectionField); // Append selection field to list item
    userList.appendChild(li);
  });
}

// Add users to DOM
// Function to create selection field
function createSelectionField(user, allUsers) {
  const select = document.createElement('select');
  select.id = `selection_${user.id}`; // Set ID for select element
  console.log(select.id)
  select.classList.add('form-control'); // Add class to select element
  select.style.marginLeft = '30px'; // Add class to select element
  if(user.username !== username){
      select.disabled = true
    }
  select.addEventListener('change', function () {
    console.log("Set User Type change function  "+ user.id)
    const selectedValue = parseInt(this.value);
    console.log("Set User Type change function  "+ selectedValue)

    if(user.username === username){
      setUserType(selectedValue === 2 ? 'questioner' : 'solver', user.id, user.username, allUsers);
    }
    
  });

  // Create options for the select element
  const options = ['Solver', 'Questioner']; // You can customize this array as needed
  options.forEach((optionText, index) => {
    const option = document.createElement('option');
    option.value = index + 1; // Assigning values to options
    option.text = optionText;
    select.appendChild(option); // Append option to select element
  });

  // Set selected value based on user type
  select.value = getUserType() === 'questioner' ? 2 : 1;
  return select;
}

//Prompt the user before leaving the chat room
document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
  if (leaveRoom) {
    window.location = '../index.html';
  }
});