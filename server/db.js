const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: "postgresql://postgres.xfxhhyfnqvcvarmloqrm:@maquinCJ00@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres",
  ssl: { rejectUnauthorized: false }, // Required for Render's PostgreSQL
});

module.exports = pool;