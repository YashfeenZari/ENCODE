/**
 * Create ENCODE LMS tables in Aiven MySQL.
 * Uses DATABASE_URL from backend/.env (same as the API).
 * Run from backend: npm run init-db
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import mysql from 'mysql2/promise'
import '../config/loadEnv.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql')

async function run() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error('DATABASE_URL not set. Create backend/.env with your Aiven URL.')
    process.exit(1)
  }

  const sql = fs.readFileSync(schemaPath, 'utf8')
  const statements = sql
    .split(/;\s*\n/)
    .map((s) => s.replace(/--.*$/gm, '').trim())
    .filter((s) => s.length > 0)

  const conn = await mysql.createConnection(url)
  try {
    for (const statement of statements) {
      await conn.query(statement)
      const match = statement.match(/CREATE TABLE\s+[`']?(\w+)[`']?/i)
      if (match) console.log('Created table:', match[1])
    }
    console.log('Schema applied successfully.')
  } finally {
    await conn.end()
  }
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
