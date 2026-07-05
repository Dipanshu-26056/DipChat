const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const {chats} = require("./data/data");
const connectDB = require("./Config/db");
const colors = require("colors");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const summarizeRoute = require("./routes/summarize.route.js");
const {notFound,errorHandler} = require("./middlewares/errorMiddleware");


console.log("MONGO_URI:", process.env.MONGO_URI);

connectDB();
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req,res) => {
    res.send("API is Running");
});

app.use('/api/user',userRoutes);
app.use('/api/chat',chatRoutes);
app.use('/api/message',messageRoutes);
app.use('/api', summarizeRoute)
app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, console.log(`Server started on PORT ${PORT}`.yellow.bold));
const io = require('socket.io')(server,{
    pingTimeout: 60000,
    cors: {
        origin: function (origin, callback) {
            if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
    },
});

io.on("connection",(socket) => {
    console.log("connected to socket.io");

    socket.on('setup', (userData) => {
        socket.join(userData._id);
        socket.emit("connected");
    });

    socket.on('join chat' , (room) => {
        socket.join(room);
        console.log("User Joined room: " + room);
    });

    socket.on('typing',(room)=>socket.in(room).emit("typing"));
    socket.on('stop typing', (room) => socket.in(room).emit("stop typing"));

    socket.on('new message',(newMessageReceived) => {
        var chat = newMessageReceived.chat;
        console.log("Chat users:", chat.users);
        if(!chat.users) return console.log('chat.users not defined');
        chat.users.forEach(user => {
            if(user._id == newMessageReceived.sender._id) return;
            socket.in(user._id).emit("message received", newMessageReceived);
        })
    });

    socket.on("disconnect", () => {
        console.log("USER DISCONNECTED");
        socket.leave(socket.id);
    });
});


