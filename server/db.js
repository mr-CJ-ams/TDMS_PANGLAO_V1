const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: "postgresql://tdms_admin:Cg1jdL6CUiBuxuBgzZ8Nttxg5Tiv0cL5@dpg-cuvauct6l47c738pm0hg-a.singapore-postgres.render.com/tdms_db",
  ssl: { rejectUnauthorized: false }, // Required for Render's PostgreSQL
});

module.exports = pool;