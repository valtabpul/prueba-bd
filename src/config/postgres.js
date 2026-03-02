import pkg from 'pg'
import 'dotenv/config'

const {Pool} = pkg

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

pool.on('connect',()=> console.log('\nConectado con la base de datos PostgresSQL '))

export const query = (text, params) => pool.query(text,params)