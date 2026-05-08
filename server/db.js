const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'ecommerce',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  // 连接池配置
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// 测试连接
pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err.message);
});

/** 单次查询 */
const query = (text, params) => pool.query(text, params);

/** 获取客户端用于事务 */
const getClient = () => pool.connect();

module.exports = { pool, query, getClient };
