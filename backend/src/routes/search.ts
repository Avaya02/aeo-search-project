import express, { Request, Response } from 'express';
import axios from 'axios';
import { pool } from '../config/db';

export const searchRouter = express.Router();

// Bright Data API configuration
const BRIGHT_DATA_URL = 'https://api.brightdata.com/serp/req';

// POST /api/search
searchRouter.post('/', async (req: Request, res: Response) => {
    const { query } = req.body;
    const BRIGHT_DATA_API_KEY = process.env.BRIGHT_DATA_API_KEY;

    if (!query) {
        return res.status(400).json({ error: 'Query is required.' });
    }

    if (!BRIGHT_DATA_API_KEY) {
        console.error('Bright Data API key is missing.');
        return res.status(500).json({ error: 'Server configuration error: Missing API key.' });
    }

    try {
        let answer: string;
        let citations: { title: string; url: string }[];

        // --- This is a MOCK API call section ---
        // For testing the UI without using API credits.
        // You will comment this section out to go live.
        console.log(`Simulating API call for query: "${query}"`);
        const mockApiResponse = {
            answer: `This is a simulated AI-generated answer for your query: "${query}". The actual answer would come from the Bright Data Search API.`,
            citations: [
                { title: 'Example Source 1: The most relevant result', url: 'https://example.com/source1' },
                { title: 'Example Source 2: Another useful article', url: 'https://example.com/source2' },
                { title: 'Example Source 3: A related blog post', url: 'https://example.com/source3' },
            ]
        };
        await new Promise(resolve => setTimeout(resolve, 1500));
        answer = mockApiResponse.answer;
        citations = mockApiResponse.citations;
        // --- End of MOCK API call section ---


        /*
        // --- ACTUAL BRIGHT DATA API CALL ---
        // Uncomment this entire block to use the real API.
        // And comment out the MOCK section above.

        console.log(`Making a real API call to Bright Data for query: "${query}"`);
        const response = await axios.post(
            BRIGHT_DATA_URL,
            {
                country: 'US',
                query: query,
            },
            {
                headers: {
                    'Authorization': `Bearer ${BRIGHT_DATA_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const data = response.data;
        
        // This is a sample parsing logic. You may need to adjust it based on
        // the actual structure of the Bright Data API response you receive.
        answer = data.answer_box?.answer || data.organic[0]?.snippet || 'No direct answer found.';
        citations = data.organic?.slice(0, 5).map((item: any) => ({
            title: item.title,
            url: item.link,
        })) || [];
        // --- End of ACTUAL BRIGHT DATA API CALL ---
        */


        // Save to PostgreSQL (this part works for both mock and real calls)
        try {
            const insertQuery = `
                INSERT INTO search_history (query, response, citations)
                VALUES ($1, $2, $3)
            `;
            const values = [query, answer, citations.map(c => c.url)];
            await pool.query(insertQuery, values);
        } catch (dbError) {
            console.error('Failed to save search history to PostgreSQL:', dbError);
        }

        res.json({ answer, citations });

    } catch (error) {
        console.error('Error fetching data from Bright Data:', error);
        if (axios.isAxiosError(error) && error.response) {
            console.error('Response data:', error.response.data);
            res.status(error.response.status).json({
                error: 'Failed to fetch data from the search API.',
                details: error.response.data
            });
        } else {
            res.status(500).json({ error: 'An unexpected server error occurred.' });
        }
    }
});