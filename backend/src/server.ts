// File: backend/src/server.ts (Final, Corrected Version)

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// ======================================================================
//  <<< --- THE CRITICAL FIX IS HERE --- >>>
//  Both of these paths are now correct for your file structure.
// ======================================================================
import { searchRouter } from './routes/search';
import { connectDB } from './config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Connect to the database
connectDB();

// API Routes
app.use('/api/search', searchRouter);

app.get('/', (req, res) => {
    res.send('AEO Search API is running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});