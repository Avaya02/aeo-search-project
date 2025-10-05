import express, { Request, Response } from 'express';
import axios from 'axios';
import { pool } from '../config/db';

export const searchRouter = express.Router();

// Bright Data API configuration
const BRIGHT_DATA_API_KEY = process.env.BRIGHT_DATA_API_KEY;
const BRIGHT_DATA_URL = '[https://api.brightdata.com/serp/req](https://api.brightdata.com/serp/req)';

// POST /api/search
searchRouter.post('/', async (req: Request, res: Response) => {
    const { query } = req.body;

    if (!query) {
        return res.status(400).json({ error: 'Query is required.' });
    }

    if (!BRIGHT_DATA_API_KEY) {
        console.error('Bright Data API key is missing.');
        return res.status(500).json({ error: 'Server configuration error: Missing API key.' });
    }

    try {
        // --- This is a MOCK API call section ---
        // In a real scenario, you would call the Bright Data API.
        // The following is a simulated response structure based on your description.
        console.log(`Simulating API call for query: "${query}"`);

        const mockApiResponse = {
            answer: `This is a simulated AI-generated answer for your query: "${query}". The actual answer would come from the Bright Data Search API.`,
            citations: [
                { title: 'Example Source 1: The most relevant result', url: '[https://example.com/source1](https://example.com/source1)' },
                { title: 'Example Source 2: Another useful article', url: '[https://example.com/source2](https://example.com/source2)' },
                { title: 'Example Source 3: A related blog post', url: '[https://example.com/source3](https://example.com/source3)' },
            ]
        };
        await new Promise(resolve => setTimeout(resolve, 1500));
        const { answer, citations } = mockApiResponse;
        // --- End of MOCK API call section ---

        // Save to PostgreSQL (optional)
        try {
            const insertQuery = `
                INSERT INTO search_history (query, response, citations)
                VALUES ($1, $2, $3)
            `;
            const values = [query, answer, citations.map(c => c.url)];
            await pool.query(insertQuery, values);
        } catch (dbError) {
            console.error('Failed to save search history to PostgreSQL:', dbError);
            // Non-blocking error
        }

        res.json({ answer, citations });

    } catch (error) {
        console.error('Error fetching data from Bright Data:', error);
        if (axios.isAxiosError(error)) {
            res.status(error.response?.status || 500).json({ error: 'Failed to fetch data from the search API.', details: error.response?.data });
        } else {
            res.status(500).json({ error: 'An unexpected server error occurred.' });
        }
    }
});
