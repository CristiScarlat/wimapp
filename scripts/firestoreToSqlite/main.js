const admin = require("firebase-admin");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Initialize Firebase
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
const dbFirestore = admin.firestore();

// Initialize SQLite
const dbPath = path.join(__dirname, "firestore_data.db");
const dbSqlite = new sqlite3.Database(dbPath);

// Configuration
const COLLECTION_NAME = "radioStations";

async function main() {
    console.log("Reading from Firestore...");

    try {
        const snapshot = await dbFirestore.collection(COLLECTION_NAME).get();

        if (snapshot.empty) {
            console.log("No documents found in Firestore collection.");
            return;
        }

        // Get all unique field names to create columns
        const fieldSet = new Set();
        const docs = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            data.__id = doc.id; // Add doc ID
            docs.push(data);
            Object.keys(data).forEach(key => fieldSet.add(key));
        });

        const fields = Array.from(fieldSet);

        // Create table SQL
        const columnsSql = fields.map(f => `"${f}" TEXT`).join(", ");
        const createTableSql = `CREATE TABLE IF NOT EXISTS "${COLLECTION_NAME}" (${columnsSql})`;

        dbSqlite.serialize(() => {
            dbSqlite.run(createTableSql);

            const placeholders = fields.map(() => "?").join(", ");
            const insertSql = `INSERT INTO "${COLLECTION_NAME}" (${fields.map(f => `"${f}"`).join(", ")}) VALUES (${placeholders})`;
            const stmt = dbSqlite.prepare(insertSql);

            docs.forEach(doc => {
                const values = fields.map(f => doc[f] != null ? doc[f].toString() : null);
                stmt.run(values);
            });

            stmt.finalize(() => {
                console.log("Data inserted into SQLite.");
                dbSqlite.close();
            });
        });

    } catch (err) {
        console.error("Error:", err);
    }
}

main();
