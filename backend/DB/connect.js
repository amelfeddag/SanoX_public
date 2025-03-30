import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

// Creating a connection pool
const pool = mysql.createPool({
    
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE, 

}).promise();

const deletion_pool = mysql.createPool({
    
    host: process.env.MYSQL_DELETION_HOST,
    user: process.env.MYSQL_DELETION_USER,
    password: process.env.MYSQL_DELETION_PASSWORD,
    database: process.env.MYSQL_DELETION_DATABASE, 

}).promise();

export { pool, deletion_pool };
