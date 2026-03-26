// src/models/StaffModel.js
const sql = require("mssql");
const config = require("../config/dbConfig");

const Staff = {
  async getAllStaff() {
    const pool = await sql.connect(config);
    const result = await pool.request().query("SELECT * FROM Staff ORDER BY id ASC");
    return result.recordset;
  },

  async getStaffById(id) {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM Staff WHERE id=@id");
    return result.recordset[0];
  },

  async createStaff(staff) {
    const { name, experience, rating, contact, image } = staff;
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("name", sql.NVarChar, name)
      .input("experience", sql.NVarChar, experience)
      .input("rating", sql.Int, rating)
      .input("contact", sql.NVarChar, contact)
      .input("image", sql.NVarChar, image)
      .query(
        "INSERT INTO Staff (name, experience, rating, contact, image) OUTPUT INSERTED.* VALUES (@name,@experience,@rating,@contact,@image)"
      );
    return result.recordset[0];
  },

  async updateStaff(id, staff) {
    const { name, experience, rating, contact, image } = staff;
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("name", sql.NVarChar, name)
      .input("experience", sql.NVarChar, experience)
      .input("rating", sql.Int, rating)
      .input("contact", sql.NVarChar, contact)
      .input("image", sql.NVarChar, image)
      .query(
        "UPDATE Staff SET name=@name, experience=@experience, rating=@rating, contact=@contact, image=@image, updatedAt=GETDATE() OUTPUT INSERTED.* WHERE id=@id"
      );
    return result.recordset[0];
  },

  async deleteStaff(id) {
    const pool = await sql.connect(config);
    await pool.request().input("id", sql.Int, id).query("DELETE FROM Staff WHERE id=@id");
    return true;
  },
};

module.exports = Staff;
