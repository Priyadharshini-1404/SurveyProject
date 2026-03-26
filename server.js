require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { sql, connectDB } = require("./config/dbConfig");


// Import all routes
const authRoutes = require("./routes/authRoutes");
const appointmentRoutes = require("./routes/appoinmentRoutes");
const surveyRoutes = require("./routes/surveyRoutes");
const cardpaymentRoutes = require("./routes/cardpaymentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const userRoutes = require("./routes/userRoutes");
const staffRoutes = require("./routes/staffRoutes");
const profileRoutes = require("./routes/profileRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const razorpayWebRoutes = require("./routes/razorpayRoutes");
const { sendNotification } = require("./config/expopushNotification");

// Initialize Express
const app = express();
const server = http.createServer(app);

// ✅ Setup Socket.IO for real-time notifications
const io = new Server(server, {
  cors: {
    origin: "*", // you can restrict this to your mobile/web app IP if needed
  },
});

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Connect Database
connectDB();
console.log("✅ Database connected:", process.env.DB_SERVER);

sendNotification();

// ✅ Store connected users (userId → socket.id)
// Store connected users (userId → array of socket IDs)
// Store connected users (userId → array of socket IDs)
const connectedUsers = {};

io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  // User registers their socket ID
  socket.on("register", (userId) => {
    if (!connectedUsers[userId]) {
      connectedUsers[userId] = [];
    }

    connectedUsers[userId].push(socket.id);

    console.log(`User ${userId} sockets:`, connectedUsers[userId]);
  });

  // Send notification to ALL admins
  socket.on("sendNotificationToAdmins", async ({ message, type }) => {
    try {
      const result = await sql.query`
        SELECT Id FROM Users WHERE Role='admin'
      `;

      const admins = result.recordset;

      admins.forEach((admin) => {
        const sockets = connectedUsers[admin.Id];

        if (sockets) {
          sockets.forEach((sockId) => {
            io.to(sockId).emit("receiveNotification", { message, type });
          });
        }
      });

      console.log("📢 Notification sent to all admins");
    } catch (err) {
      console.error(err);
    }
  });

  // On disconnect remove socket
  socket.on("disconnect", () => {
    console.log("🔴 Disconnected:", socket.id);

    Object.keys(connectedUsers).forEach((userId) => {
      connectedUsers[userId] = connectedUsers[userId].filter(
        (id) => id !== socket.id
      );
      if (connectedUsers[userId].length === 0) {
        delete connectedUsers[userId];
      }
    });
  });
});



// API to save token
app.post('/api/save-token', async (req, res) => {
  const { pushToken, userId } = req.body;

  try {

    await sql.query`
      INSERT INTO PushTokens (userId, token)
      VALUES (${userId}, ${pushToken})
    `;

    res.send({ message: 'Token saved successfully' });
  } catch (err) {

    res.status(500).send('Error saving token');
  }
});


// ✅ Expose io globally for controllers (e.g., surveyController, appointmentController)
app.set("io", io);

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/surveys", surveyRoutes);
app.use("/api/cardpayments", cardpaymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api", razorpayWebRoutes);


// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
