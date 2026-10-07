"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const pg_1 = require("pg");
const DB_USER = process.env.DB_USER || "zannu";
const DB_NAME = process.env.DB_NAME || "ndova_db";
const PG_HOST = process.env.PG_HOST || "localhost";
const PG_PORT = Number(process.env.PG_PORT || 5432);
const PG_ADMIN_USER = process.env.PG_ADMIN_USER || "postgres";
const DB_PASS = process.env.DB_PASS;
const PG_ADMIN_PASSWORD = process.env.PG_ADMIN_PASSWORD;
if (!DB_PASS) {
    throw new Error("DB_PASS is required");
}
if (!PG_ADMIN_PASSWORD) {
    throw new Error("PG_ADMIN_PASSWORD is required");
}
const quoteIdentifier = (value) => `"${value.replace(/"/g, '""')}"`;
async function setupDatabase() {
    console.log("Setting up PostgreSQL for Ndova...");
    const admin = new pg_1.Client({
        host: PG_HOST,
        port: PG_PORT,
        user: PG_ADMIN_USER,
        password: PG_ADMIN_PASSWORD,
        database: "postgres",
    });
    await admin.connect();
    try {
        // Create/update role
        const role = await admin.query("SELECT 1 FROM pg_roles WHERE rolname = $1", [DB_USER]);
        const passwordLiteral = await admin.query("SELECT quote_literal($1) AS password", [DB_PASS]);
        const quotedPassword = passwordLiteral.rows[0].password;
        if (role.rowCount === 0) {
            await admin.query(`CREATE ROLE ${quoteIdentifier(DB_USER)} WITH LOGIN PASSWORD ${quotedPassword}`);
            console.log(`Role "${DB_USER}" created.`);
        }
        else {
            await admin.query(`ALTER ROLE ${quoteIdentifier(DB_USER)} WITH PASSWORD ${quotedPassword}`);
            console.log(`Role "${DB_USER}" already exists — password updated.`);
        }
        // Create database
        const database = await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [DB_NAME]);
        if (database.rowCount === 0) {
            await admin.query(`CREATE DATABASE ${quoteIdentifier(DB_NAME)} OWNER ${quoteIdentifier(DB_USER)}`);
            console.log(`Database "${DB_NAME}" created.`);
        }
        else {
            console.log(`Database "${DB_NAME}" already exists.`);
        }
        // Grant database privileges
        await admin.query(`GRANT ALL PRIVILEGES ON DATABASE ${quoteIdentifier(DB_NAME)}
       TO ${quoteIdentifier(DB_USER)}`);
    }
    finally {
        await admin.end();
    }
    // Connect to target database
    const database = new pg_1.Client({
        host: PG_HOST,
        port: PG_PORT,
        user: PG_ADMIN_USER,
        password: PG_ADMIN_PASSWORD,
        database: DB_NAME,
    });
    await database.connect();
    try {
        console.log(`Fixing schema permissions on "${DB_NAME}"...`);
        await database.query(`GRANT ALL ON SCHEMA public TO ${quoteIdentifier(DB_USER)}`);
        await database.query(`ALTER SCHEMA public OWNER TO ${quoteIdentifier(DB_USER)}`);
    }
    finally {
        await database.end();
    }
    console.log("");
    console.log("Database setup completed.");
}
setupDatabase().catch((error) => {
    console.error("Database setup failed:");
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=db-setup.js.map