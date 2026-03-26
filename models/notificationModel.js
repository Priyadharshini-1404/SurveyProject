// backend/models/notificationModel.js
const sql = require("mssql");
const dbConfig = require("../config/dbConfig");

// ✅ Create a reusable connection pool
let poolPromise = null;

async function getPool() {
  try {
    if (!poolPromise) {
      poolPromise = sql.connect(dbConfig);
      console.log("✅ MSSQL pool created");
    }
    return await poolPromise;
  } catch (err) {
    console.error("❌ Database pool connection failed:", err);
    throw err;
  }
}

// ✅ Create a new notification
exports.createNotification = async (data) => {
  try {
    const pool = await getPool();
    const request = pool.request(); // ✅ pool.request() is valid now

    request.input("senderId", sql.Int, data.senderId);
    request.input("receiverId", sql.Int, data.receiverId);
    request.input("message", sql.NVarChar(255), data.message);
    request.input("type", sql.NVarChar(50), data.type);

    await request.query(`
      INSERT INTO Notifications (senderId, receiverId, message, type, isRead, createdAt)
      VALUES (@senderId, @receiverId, @message, @type, 0, GETDATE())
    `);

    console.log("✅ Notification added to DB");
  } catch (err) {
    console.error("❌ Error in createNotification:", err);
    throw err;
  }
};

// ✅ Get all notifications for a user
exports.getNotificationsByReceiver = async (receiverId) => {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("receiverId", sql.Int, receiverId)
      .query(`
        SELECT * FROM Notifications
        WHERE receiverId = @receiverId
        ORDER BY createdAt DESC
      `);
    return result.recordset;
  } catch (err) {
    console.error("❌ Error in getNotificationsByReceiver:", err);
    throw err;
  }
};
