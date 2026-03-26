const sql = require("mssql");
require("dotenv").config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,        // e.g. LAPTOP-2Q6AIJIL\SQLEXPRESS
  database: process.env.DB_DATABASE,    // <-- corrected
  port: parseInt(process.env.DB_PORT),
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
};

const connectDB = async () => {
  try {
    const pool = await sql.connect(config);
    console.log("📌 MSSQL Connected Successfully!");

    // Debug: show the current DB and list of tables
    const dbNameRes = await pool.request().query("SELECT DB_NAME() AS currentDB");
    console.log("🔎 Connected database:", dbNameRes.recordset[0].currentDB);

    const tables = await pool.request().query(`
      SELECT TABLE_SCHEMA, TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_TYPE = 'BASE TABLE'
    `);
    console.log("🗂️ Tables in connected DB:", tables.recordset.map(r => `${r.TABLE_SCHEMA}.${r.TABLE_NAME}`).join(", "));

    const result = await pool.request().query('SELECT TOP 1 * FROM dbo.Users');
    console.log(result.recordset);

    return pool;
  } catch (err) {
    console.error("❌ MSSQL Connection Error:", err);
    throw err;
  }
};

module.exports = {
  sql,
  connectDB,
};
