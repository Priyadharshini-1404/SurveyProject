const sql = require("mssql");
const bcrypt = require("bcryptjs");
const config = require("../config/dbConfig");

// ---------------- GET LOGGED-IN USER ----------------
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;  // after middleware fix

    const pool = await sql.connect(config);

    const result = await pool.request()
      .input("id", sql.Int, userId)
      .query(`
        SELECT id, name, email, phone, role, profilePic
        FROM Users
        WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error("Profile Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ---------------- UPDATE PROFILE (name, phone) ----------------
exports.updateProfile = async (req, res) => {
  const { name, phone } = req.body;

  try {
    const pool = await sql.connect(config);

    await pool
      .request()
      .input("id", sql.Int, req.user.id)
      .input("name", sql.NVarChar, name)
      .input("phone", sql.NVarChar, phone)
      .query("UPDATE Users SET name=@name, phone=@phone WHERE id=@id");

    res.json({ success: true, message: "Profile updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- CHANGE PASSWORD ----------------
exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const pool = await sql.connect(config);

    // Fetch old password
    const result = await pool
      .request()
      .input("id", sql.Int, req.user.id)
      .query("SELECT password FROM Users WHERE id=@id");

    const user = result.recordset[0];

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Old password incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);

    await pool
      .request()
      .input("id", sql.Int, req.user.id)
      .input("password", sql.NVarChar, hashed)
      .query("UPDATE Users SET password=@password WHERE id=@id");

    res.json({ success: true, message: "Password updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- UPLOAD PROFILE PIC ----------------
exports.uploadProfilePic = async (req, res) => {
  try {
    const fileUrl = `${process.env.BASE_URL}/uploads/${req.file.filename}`;

    const pool = await sql.connect(config);
    await pool
      .request()
      .input("id", sql.Int, req.user.id)
      .input("pic", sql.NVarChar, fileUrl)
      .query("UPDATE Users SET profilePic=@pic WHERE id=@id");

    res.json({ success: true, profilePic: fileUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
