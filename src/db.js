const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const logger = require('./logger');

function init(dbPath) {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const db = new Database(dbPath);
    // Создаём таблицу, если не существует
    db.exec(`
        CREATE TABLE IF NOT EXISTS readings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        topic TEXT NOT NULL,
        value REAL NOT NULL,
        ts INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_readings_ts ON readings(ts);
    `);

    const insertStmt = db.prepare('INSERT INTO readings (topic, value, ts) VALUES (?, ?, ?)');
    const getLastNStmt = db.prepare('SELECT id, topic, value, ts FROM readings ORDER BY ts ASC LIMIT ?');
    const getAllStmt = db.prepare('SELECT id, topic, value, ts FROM readings ORDER BY ts ASC');

    return {
        insert: (topic, value, ts) => {
        const info = insertStmt.run(topic, value, ts);
        logger.info('Inserted row id=', info.lastInsertRowid, 'value=', value, 'ts=', ts);
        return info.lastInsertRowid;
        },
        getAll: () => getAllStmt.all(),
        getLastN: (n) => getLastNStmt.all(n)
    };
}

module.exports = { init };
