// const {clientSocket} = require("./controllers/auth/chat");
// const socket = io("http://localhost:4000");


// function name(userId) {
//     clientSocket.on('connect', () => {
//         const receiverId = 3; 
//         const userId = 4; 
//         clientSocket.emit('chat-request', { receiverId, userId });

//     });
//     }
//     console.log("client socket--------->", clientSocket);
// // name(2)

// socket.on('broadcastEvent', (recievedData) => {
//     console.log('Received data from the server:', recievedData);
// });

// socket.on('disconnect', () => {
//     console.log('Disconnected from the Socket.io server');
// });

// module.exports={name};


// // const socket = require('socket.io-client')('http://localhost:4000'); // Replace with your server URL

// // socket.on('chat-request', (receiverId, userId) => {
// //   console.log(`Received chat request from user ${userId} to ${receiverId}`);
// // });

// // socket.on('connect', () => {
// //   console.log('Connected to the server');
// // });

// // socket.on('disconnect', () => {
// //   console.log('Disconnected from the server');
// // });
