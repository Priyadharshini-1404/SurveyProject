// models/UserModel.js
const { sql } = require("../config/dbConfig");

const User = {
  findUserByEmail: async (email) => {
    const result = await sql.query`
      SELECT * FROM Users WHERE email = ${email}
    `;
    return result.recordset[0];
  },

  createUser: async (user) => {
    const result = await sql.query`
      INSERT INTO Users (name, email, password, role)
      OUTPUT INSERTED.*
      VALUES (${user.name}, ${user.email}, ${user.password}, ${user.role})
    `;
    return result.recordset[0];
  }
};

module.exports = User;
