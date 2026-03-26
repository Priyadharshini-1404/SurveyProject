const jwt = require('jsonwebtoken');
const sql = require('mssql');
const config = require('../config/dbConfig');

exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  console.log(token);
  if (!token) return res.status(401).json({ message: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;    // <-- IMPORTANT FIX
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};


exports.adminOnly = async (req, res, next) => {
  try {
    const pool = await sql.connect(config);

    const result = await pool.request().input('id', sql.Int, req.user.id)
      .query('SELECT role FROM Users WHERE id=@id');
    console.log(result)
    const role = result.recordset?.[0]?.role;
    if (role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    next();
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};
