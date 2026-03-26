const sql = require('mssql');
const bcrypt = require('bcryptjs');
const config = require('../config/dbConfig');

exports.getAllUsers = async (req, res) => {
  try {
    const { id } = req.user;
    const pool = await sql.connect(config);
    const result = await pool.request().query(`SELECT id, name, email, role FROM Users WHERE id != ${id} ORDER BY id DESC`);
    res.json(result.recordset);
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

exports.addUserByAdmin = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
  try {
    const pool = await sql.connect(config);
    const hashed = await bcrypt.hash(password, 10);
    await pool.request()
      .input('name', sql.NVarChar, name)
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, hashed)
      .input('role', sql.NVarChar, role || 'user')
      .query('INSERT INTO Users (name,email,password,role) VALUES(@name,@email,@password,@role)');
    res.json({ success: true, message: 'User added' });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

exports.updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  try {
    const pool = await sql.connect(config);
    await pool.request().input('id', sql.Int, id).input('role', sql.NVarChar, role)
      .query('UPDATE Users SET role=@role WHERE id=@id');
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await sql.connect(config);
    await pool.request().input('id', sql.Int, id).query('DELETE FROM Users WHERE id=@id');
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};
