const Notification = require("../models/notificationModel");
const sql = require("mssql");
const dbConfig = require("../config/dbConfig");

// SEND NOTIFICATION TO ALL ADMINS
exports.createNotification = async (req, res) => {
  try {
    const { senderId, message, type } = req.body;

    if (!senderId || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const pool = await sql.connect(dbConfig);

    // 1️⃣ Get all admins
    const admins = await pool.request().query(`
      SELECT id FROM Users WHERE role = 'admin'
    `);

    if (admins.recordset.length === 0) {
      return res.status(404).json({ message: "No admins found" });
    }

    // 2️⃣ Send notification to each admin
    for (let admin of admins.recordset) {
      await Notification.createNotification({
        senderId,
        receiverId: admin.id,
        message,
        type
      });
    }

    res.status(201).json({ message: "Notification sent to ALL admins" });

  } catch (error) {
    console.error("Error sending notifications to admins:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// ✅ Get notifications for a specific receiver
exports.getNotifications = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const notifications = await Notification.getNotificationsByReceiver(receiverId);
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
