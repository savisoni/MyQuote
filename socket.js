const socketIO = require('socket.io');

let io;
console.log("----------------ssssssssss");
function initializeSocket(server) {
  io = socketIO(server);

  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

  return io;
}

function getIo() {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

module.exports = { initializeSocket, getIo };






// const socketIo = require("socket.io");
// let io;


// const userSocketMap = new Map();
// function ioSocket(server){

//     io = socketIo(server);

//     io.on("connection",(socket)=>{
//         console.log("user connected with socket.io");
//         // socket.on("login", (userId)=>{
//         //     // userSocketMap.set(userId,socket.id);
//         //     // console.log("map-------->", userSocketMap);
//         // });
//         socket.on('chat-request', (data) => {
//             // Handle the chat request here
//             const { receiverId, userId } = data;
//             userSocketMap.set(userId,socket.id);
//             // userSocketMap.set(receiverId, io.sockets.sockets[socket.id]);

//             console.log("userSocketMap---------->", userSocketMap);

//             const roomId = `chat_${Math.min(receiverId, userId)}_${Math.max(receiverId, userId)}`;

//             socket.join(roomId);
//         console.log("room--", roomId);
        
//             io.to(roomId).emit('chat-request', { userId }); 
//             // You can now process the request or send it to the intended recipient.
//           });
//         // socket.on("chat-request",(receiverId,userId)=>{
            
           
//         // })
        
        
// console.log("socket.id----", socket.id);
//         // socket.on("customEvent",(recievedData)=>{
//         //     console.log("recieved data from client", recievedData);
//         //     io.emit("broadcastEvent", "hello client");

//         // })
//     })

// }

// module.exports= {
//     ioSocket
// }