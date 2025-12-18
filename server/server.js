import express from 'express';
import cors from 'cors';
import "dotenv/config";
import http from 'http';
import mongodb from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import { Server } from "socket.io";





// create Server app HTTP server
let app = express();
const server = http.createServer(app);


// -------------------initialize socket.io server-------------------//

export const io = new Server(server, {
    cors: { origin: "*" }
})

// store online users//

export const userSocketMap = {}; //{ userId: SocketId }

// socket.io connection handler function //

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("User Connected", userId);

    if (userId) {
        userSocketMap[userId] = socket.id
    }

    // Emitt online user to all connected clients

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("User disconnect", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
    })
})


//-------------------------------------------------------------------//

//middlewares
app.use(express.json({ limit: "10mb" }))
app.use(cors());

app.use('/api/status', (req, res) => {
    res.send("Server is up and running");
})
app.use(express.urlencoded({ extended: true }))

// user routes //
app.use("/api/auth", userRouter);

// message Routes//
app.use("/api/messages", messageRouter)

//connect to mongodb//
await mongodb();

if (process.env.NODE_ENV !== "production") {
    const Port = process.env.PORT;
    server.listen(Port, () => {

        console.log(`Server is running on port http://localhost:${Port}`);
    });
}

// exports server for Vercel
export default server;