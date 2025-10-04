const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_FILE = path.join(__dirname, 'arcadia.db');
const INIT_SQL = path.join(__dirname, 'init_db.sql');

const exists = fs.existsSync(DB_FILE);
const db = new Database(DB_FILE);

if (!exists) {
  const sql = fs.readFileSync(INIT_SQL, 'utf8');
  db.exec(sql);
  console.log('📘 Base de dados criada com sucesso.');
}

module.exports = db;
