const { Pool } = require('pg')

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: 'development' !== process.env.NODE_ENV }
})

const allQuery = 'SELECT * FROM websites'
const selectQuery = 'SELECT * FROM websites WHERE url = $1'
const insertQuery = 'INSERT INTO websites ("url", "isHttps") VALUES ($1, $2)'
const deleteQuery = 'DELETE FROM websites WHERE url = $1'
const updateQuery = 'UPDATE websites set "isUp" = $1, "upCycles" = $2, "downCycles" = $3, "lastCheck" = NOW() WHERE url = $4'

exports.getAll = () => pool.query(allQuery)

exports.getWebsite = url => pool.query(selectQuery, [url])

exports.insert = (url, isHttps) => pool.query(insertQuery, [url, isHttps])

exports.remove = url => pool.query(deleteQuery, [url])

exports.update = values => pool.query(updateQuery, values)
