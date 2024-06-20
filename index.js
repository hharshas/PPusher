const http = require("http");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config({ path: "./config.env" });

const express = require("express");
const app = express();
const socketUtils = require("./utils/socketUtils");

const server = http.createServer(app);
const io = socketUtils.sio(server); // Initialize Socket.IO
socketUtils.connection(io); // Correctly call the connection function

const socketIOMiddleware = (req, res, next) => {
  req.io = io;
  next();
};

// CORS
app.use(cors());

// ROUTES
app.use("/api/v1/hello", socketIOMiddleware, (req, res) => {
  req.io.emit("message", `Hello, ${req.originalUrl}`);
  res.send("hello world!");
});

// New route to keep the server running
app.use("/api/v1/keepalive", socketIOMiddleware, (req, res) => {
  const message = "keepalive ping";
  req.io.emit("keepalive", message);
  res.send(message);
});

// LISTEN
const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.log(`App running on port ${port}...`);
  
  // Set interval to call the keepalive endpoint every 10 seconds
  setInterval(() => {
    const http = require('http');
    const options = {
      hostname: 'localhost',
      port: port,
      path: '/api/v1/keepalive',
      method: 'GET',
    };

    const req = http.request(options, (res) => {
      res.on('data', (d) => {
        process.stdout.write(d);
      });
    });

    req.on('error', (error) => {
      console.error(error);
    });

    req.end();
  }, 5000); // 10 seconds interval
});
