import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Check for required environment variables
const requiredEnv = ['PG_HOST', 'PG_USER', 'PG_PORT', 'PG_PASSWORD', 'PG_DATABASE'];
for (const varName of requiredEnv) {
    if (!process.env[varName]) {
        console.warn(`Warning: Environment variable ${varName} is not set. Database connection may fail.`);
    }
}

export const pool = new Pool({
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    port: parseInt(process.env.PG_PORT || '5432', 10),
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
});

// Function to connect to the database and initialize the table
export const connectDB = async () => {
    try {
        await pool.connect();
        console.log('PostgreSQL connected successfully.');
        await initializeDb();
    } catch (error) {
        console.error('PostgreSQL connection failed:', error);
        process.exit(1); // Exit process with failure
    }
};

// Function to create the search_history table if it doesn't exist
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
        // Do not exit, as the app can run without history logging
    }
};
