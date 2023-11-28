const express = require("express");

const bodyParser = require("body-parser");
const sequelize = require("./util/database");
const passport = require("passport");
const passportConfig = require("./helpers/passport");
const cookieParser = require("cookie-parser");
const exphbs = require("express-handlebars");
const models = require("./models/index");
const mainRoute = require("./routes");
const http = require("http");
const { Op } = require("sequelize");
const path = require("path")
const User = models.user;
const MsgRequest = models.msgrequest;
const Chat = models.chat;
const app = express();
const helpers = require('handlebars-helpers')();

const server = http.createServer(app);
app.use(cookieParser());
app.use(passport.initialize());
passportConfig(passport);
const hbs = exphbs.create({ extname: "hbs" ,helpers:{...helpers}});
app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "public")));

let Message = [];

console.log("dir--------", __dirname);

app.use("/", mainRoute);

const io = require("socket.io")(server);
const connectedUsers={};
io.on("connection", function (socket) {
  console.log("user connected");
  socket.on("userLoggedIn", async ({ userId }) => {
    console.log(`User ${userId} connected`);

    try {
      const user = await User.findOne({ where: { id: userId } });

      if (user) {
        connectedUsers[userId] = socket.id;
        console.log("success---------------" , connectedUsers);

        socket.emit("welcome", { message: `Welcome, ${userId}!` });
      } else {
        console.log(`User ${userId} not found in the database`);
      }
    } catch (error) {
      console.error("Error querying the database:", error);
    }
  });

   //existing chat
   socket.on("existingChats", async function (data) {
    let chats = await Chat.findAll({
      where: {
        [Op.or]: [
          { senderId: data.senderId, receiverId: data.receiverId },
          { senderId: data.receiverId, receiverId: data.senderId },
        ],
      },
    });

    socket.emit("loadRequests", { chats: chats });
  });

  socket.on("chatRequest", function (data) {
    socket.emit("loadNewChat", data);
  });

  socket.on("sendChatRequest", async function (data) {
    try {
      const { senderId, receiverId } = data;
      console.log("receiverId-------", receiverId);
      console.log("connnectedUserts-------", connectedUsers);

      console.log("connnectedUserts-------", connectedUsers[receiverId]);
      const receiverSocket = connectedUsers[receiverId];
      console.log("receiverSocket-----", receiverSocket);
      const messageRequest = await MsgRequest.create({
        receiverId: receiverId,
        senderId: senderId,
      });
     console.log("dfghnbgvxzdfghjkmhngbvfcdxsdfghjk");
     io.to(connectedUsers[senderId]).emit("receiveChatRequest", { senderId });
     console.log("After emit");

    
    
    } catch (error) {
      console.log(error);
      // Handle the error as needed
      io.emit("sendChatRequestResponse", {
        error: "Error sending chat request",
      });
    }
  });
  // Your existing server-side code...

// Listen for the response to the chat request
socket.on("respondToChatRequest", async function (data) {
  try {
      const { senderId, receiverId, isAccepted } = data;

      console.log("dataaaa", data);
      io.to(connectedUsers[senderId]).emit("chatRequestResponse", { receiverId, isAccepted });
  } catch (error) {
      console.error(error);
  }
});

// Listen for the chat request acceptance
socket.on("chatRequestAccepted", async function (data) {
  try {
      const { senderId, receiverId } = data;
          
     
    console.log("accepted");

      socket.broadcast.emit("chatRequestAcceptedResponse", { receiverId });
      await MsgRequest.update(
        { isApproved: 1 },
        {
            where: {
                senderId: senderId,
                receiverId: receiverId,
               
            }
        }
    );
  } catch (error) {
      console.error(error);
  }
});


  //check if request approved or not
  socket.on("checkChatRequestStatus", async function (data) {
    try {
      const { senderId, receiverId } = data;

      // Check if a chat request has been sent
      const existingRequest = await MsgRequest.findOne({
        where: { senderId: senderId, receiverId: receiverId },
      });
      console.log("checkChatrequeststatus");
      if (existingRequest) {
        socket.emit("checkChatRequestStatusResponse", {
          isRequestSent: true,
          isApproved: existingRequest.isApproved,
        });
      } else {
        console.log("else -----------");
        socket.emit("checkChatRequestStatusResponse", { isRequestSent: false });
      }
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("storeChatMessage", async function (data) {
    try {
      const { receiverId, requestMessage, senderId } = data;

      const messageData = await Chat.create({
        receiverId: receiverId,
        message: requestMessage,
        senderId: senderId,
      });
      io.to(socket.id).emit("storeChatMessageResponse", { data: messageData });

      socket.broadcast.emit("storeChatMessageResponse", { data: messageData });

    } catch (error) {
      console.log(error);
      socket.emit("storeChatMessageResponse", {
        error: "Error storing chat message",
      });
    }
  });

 
 

  socket.on("disconnect", function () {
    console.log("User disconnected");
  });
});

app.use((error, req, res, next) => {
  console.log("error------>>>>", error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  console.log("errorrrfdkslsdfgnmkdlsjhnrbgmvcksjndmf");
  res.status(status).json({ status: status, message: message, data: data });
});

module.exports = { io, server };

(async () => {
  try {
    await sequelize.authenticate();
    console.log("database connection established successfully");
    await sequelize.sync();
    console.log("database synchronization completed");
    server.listen(4000, () => {
      console.log("server listening on http://localhost:4000");
    });
  } catch (error) {
    console.log("Not able to connect to database", error.message);
  }
})();
