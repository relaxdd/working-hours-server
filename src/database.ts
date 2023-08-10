import mysql from 'mysql2'

const database = mysql.createConnection({
  host: process?.env?.['DB_HOST'] || '',
  database: process?.env?.['DB_NAME'] || '',
  user: process?.env?.['DB_USER'] || '',
  password: process?.env?.['DB_PASSWORD'] || '',
  port: (() => {
    const port = process.env?.['DB_PORT']
    return port ? Number(port) : undefined
  })() || 3306,
})

export default database