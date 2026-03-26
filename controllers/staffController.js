const sql = require("mssql");
const config = require("../config/dbConfig");

// GET all staff
exports.getAllStaff = async (req, res) => {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request().query("SELECT * FROM Staff ORDER BY id ASC");
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET staff by id
exports.getStaffById = async (req, res) => {
  const { id } = req.params;
  try {
    let pool = await sql.connect(config);
    let result = await pool.request().input("id", sql.Int, id)
      .query("SELECT * FROM Staff WHERE id=@id");
    if (result.recordset.length === 0) return res.status(404).json({ message: "Staff not found" });
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// CREATE staff
exports.createStaff = async (req, res) => {
  const { name, experience, rating, contact, image } = req.body;
  try {
    let pool = await sql.connect(config);
    let result = await pool.request()
      .input("name", sql.NVarChar, name)
      .input("experience", sql.NVarChar, experience)
      .input("rating", sql.Int, rating)
      .input("contact", sql.NVarChar, contact)
      .input("image", sql.NVarChar, image)
      .query("INSERT INTO Staff (name, experience, rating, contact, image) OUTPUT INSERTED.* VALUES (@name,@experience,@rating,@contact,@image)");
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE staff
exports.updateStaff = async (req, res) => {
  const { id } = req.params;
  console.log('update', id);
  const { name, experience, rating, contact, image } = req.body;
  try {
    let pool = await sql.connect(config);
    let result = await pool.request()
      .input("id", sql.Int, id)
      .input("name", sql.NVarChar, name)
      .input("experience", sql.NVarChar, experience)
      .input("rating", sql.Int, rating)
      .input("contact", sql.NVarChar, contact)
      .input("image", sql.NVarChar, image)
      .query("UPDATE Staff SET name=@name, experience=@experience, rating=@rating, contact=@contact, image=@image OUTPUT INSERTED.* WHERE id=@id");
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE staff
exports.deleteStaff = async (req, res) => {
  const { id } = req.params;
  try {
    let pool = await sql.connect(config);
    await pool.request().input("id", sql.Int, id).query("DELETE FROM Staff WHERE id=@id");
    res.json({ message: "Staff deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
