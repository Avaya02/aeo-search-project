// File: backend/src/config/db.ts (Your Correct, Working Version)

import { Pool } from 'pg';
import dotenv from 'dotenv';

// This is the correct way to load the .env file from the 'backend' root
dotenv.config();

export const pool = new Pool({
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    port: parseInt(process.env.PG_PORT || '5432', 10),
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
});

export const connectDB = async () => {
    try {
        await pool.connect();
        console.log('PostgreSQL connected successfully.');
        await initializeDb();
    } catch (error) {
        console.error('PostgreSQL connection failed:', error);
        process.exit(1); // This is important for stopping on DB errors
    }
};

const initializeDb = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS search_history (
            id SERIAL PRIMARY KEY,
            query VARCHAR(255) NOT NULL,
            response TEXT NOT NULL,
            citations TEXT[],
            timestamp TIMESTAMPTZ DEFAULT NOW()
        );
    `;
    try {
        await pool.query(createTableQuery);
        console.log('Database table "search_history" is ready.');
    } catch (error) {
        console.error('Error initializing database table:', error);
    }
};