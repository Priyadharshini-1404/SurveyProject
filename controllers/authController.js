// backend/controllers/authController.js
const sql = require("mssql");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/dbConfig");

// Helpers
const generateTokens = (user) => {
  const accessToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
  return { accessToken, refreshToken };
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const pool = await sql.connect(config);

    const check = await pool.request().input("email", sql.NVarChar, email).query("SELECT id FROM Users WHERE email=@email");
    if (check.recordset.length) return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const insert = await pool.request()
      .input("name", sql.NVarChar, name)
      .input("email", sql.NVarChar, email)
      .input("password", sql.NVarChar, hashed)
      .input("role", sql.NVarChar, role || "user")
      .query("INSERT INTO Users (name,email,password,role) OUTPUT INSERTED.* VALUES(@name,@email,@password,@role)");

    const user = insert.recordset[0];
    res.status(201).json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    const pool = await sql.connect(config);

    const result = await pool.request().input("email", sql.NVarChar, email).query("SELECT * FROM Users WHERE email=@email");
    const user = result.recordset[0];
    if (!user) return res.status(400).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid password" });

    const tokens = generateTokens(user);

    // Return access + refresh + user
    res.json({
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const pool = await sql.connect(config);
    const result = await pool.request().input("id", sql.Int, decoded.id).query("SELECT id, name, email, role FROM Users WHERE id=@id");
    if (!result.recordset.length) return res.status(404).json({ message: "User not found" });

    const user = result.recordset[0];
    const accessToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "15m" });
    res.json({ accessToken });
  } catch (err) {
    console.error("Refresh Error:", err);
    res.status(403).json({ message: "Invalid refresh token" });
  }
};

exports.me = async (req, res) => {
  try {
    // This route expects verifyToken middleware to set req.user
    const pool = await sql.connect(config);
    const result = await pool.request().input("id", sql.Int, req.user.id)
      .query("SELECT id, name, email, role FROM Users WHERE id=@id");
    if (!result.recordset.length) return res.status(404).json({ message: "User not found" });
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
