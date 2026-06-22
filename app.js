require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const connectedDB = require("./shared/config/database");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { notFoundHandler, globalErrorHandler } = require("./shared/middlewares/error/globalErrorHandler.js");
const v1Routes = require('./routes/index.js');
const http = require("http");
const { Server } = require("socket.io");
const chatSocket = require("./modules/community/chat/chat.socket");

// Create HTTP Server for Socket.IO
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  }
});
app.set("io", io);

// Initialize Socket.IO handlers
chatSocket(io);

// Connect Database
connectedDB();

// Middlewares

// 1.CORS (before cookies)
app.use(cors({
  // Allow all origins (change to specific domain in production, like: origin: process.env.CLIENT_URL)
  origin: process.env.CLIENT_URL,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Important because cookies are sent via CORS
}));

app.use(express.json());

// 2.Cookie Parser
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// 3.Logger
if (process.env.NODE_ENV === "dev") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
  });
}

// Routes
app.use('/api/v1/', v1Routes);

// Global Error Handling
app.use(notFoundHandler)
app.use(globalErrorHandler);

// Server
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});