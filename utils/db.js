const { Pool } = require('pg')

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: 'development' !== process.env.NODE_ENV }
})

const allQuery = 'SELECT * FROM websites'
const selectQuery = 'SELECT * FROM websites WHERE url = $1'
const insertQuery = 'INSERT INTO websites (url) VALUES ($1)'

exports.getAll = () => pool.query(allQuery)

exports.getWebsite = (url) => pool.query(selectQuery, [url])

exports.insert = (url) => pool.query(insertQuery, [url])
