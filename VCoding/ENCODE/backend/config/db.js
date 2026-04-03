import mysql from 'mysql2/promise'
import './loadEnv.js'

const sslDisabled = process.env.DB_SSL === 'false'
const rejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true'

const dbConfig = process.env.DATABASE_URL
  ? { uri: process.env.DATABASE_URL }
  : {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 25060,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: sslDisabled ? undefined : { rejectUnauthorized },
    }

let pool

export function getPool() {
  if (!pool) {
    if (dbConfig.uri) {
      pool = mysql.createPool(dbConfig.uri)
    } else {
      pool = mysql.createPool({
        host: dbConfig.host,
        port: dbConfig.port,
        database: dbConfig.database,
        user: dbConfig.user,
        password: dbConfig.password,
        ssl: dbConfig.ssl,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      })
    }
  }
  return pool
}

export async function query(sql, params = []) {
  const p = getPool()
  const [rows] = await p.execute(sql, params)
  return rows
}
