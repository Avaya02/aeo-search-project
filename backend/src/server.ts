import express from 'express';
import cors from 'cors';
// import dotenv from 'dotenv';
import { searchRouter } from './routes/search';
import { connectDB } from './config/db';
import 'dotenv/config'; 


// Load environment variables
// dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to PostgreSQL and initialize table
connectDB();

// API Routes
app.use('/api/search', searchRouter);

// Root endpoint
app.get('/', (req, res) => {
    res.send('AEO Search API is running...');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
