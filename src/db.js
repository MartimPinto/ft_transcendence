import Database from "better-sqlite3";

const db = new Database('app.db');
const query = `
	CREATE TABLE users(
		id INTEGER PRIMARY KEY,
		username STRING NOT NULL UNIQUE,
		password STRING NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	)
`
//db.exec(query);

export default db;