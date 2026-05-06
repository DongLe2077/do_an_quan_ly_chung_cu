const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'dongle2077',
        database: process.env.DB_NAME || 'quanlychungcu',
        multipleStatements: true
    });

    try {
        console.log('Connected to MySQL. Reading migration file...');
        const sqlPath = path.join(__dirname, 'src', 'database', 'migration_rename_english.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        console.log('Running migration...');
        await connection.query(sql);
        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await connection.end();
    }
}

runMigration();
