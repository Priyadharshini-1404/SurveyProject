// updatePassword.js
const { sql, connectDB } = require("./config/dbConfig");
const bcrypt = require("bcryptjs");

const email = "rockfort.md@gmail.com"; // user email to update
const newPassword = "rockfort@123";    // plain password you want to set

(async () => {
  try {
    // Connect to DB
    const pool = await connectDB();

    // Generate hash
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log("Hashed password:", hashedPassword);

    // Update user password
    const result = await pool.request()
      .input("email", sql.NVarChar, email)
      .input("password", sql.NVarChar, hashedPassword)
      .query(`
        UPDATE Users
        SET password = @password
        WHERE email = @email
      `);

    console.log(`Password updated for user: ${email}`);
    process.exit(0);

  } catch (err) {
    console.error("Error updating password:", err);
    process.exit(1);
  }
})();
