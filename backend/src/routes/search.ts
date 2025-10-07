import express, { Request, Response } from 'express';
import axios from 'axios';
import { pool } from '../config/db';
import * as cheerio from 'cheerio';

export const searchRouter = express.Router();

// This is the new, correct endpoint from your curl command
const BRIGHT_DATA_URL = 'https://api.brightdata.com/request';

// This is the new zone name from your curl command
const SERP_API_ZONE = 'serp_api1';

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
        // --- THIS IS THE FINAL, CORRECT API CALL ---
        // It matches the structure of your new SERP API curl command.

        console.log(`Making SERP API request for query: "${query}"`);

        // We build the full Google URL to send to the API
        const targetUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&gl=in`;

        const response = await axios.post(
            BRIGHT_DATA_URL,
            {
                zone: SERP_API_ZONE,
                url: targetUrl,
                format: 'raw', // We request the raw HTML to parse it ourselves
            },
            {
                headers: {
                    'Authorization': `Bearer ${BRIGHT_DATA_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        // --- PARSE THE HTML RESPONSE ---
        // The response.data is the raw HTML of the Google search results page.
        const $ = cheerio.load(response.data);

        const citations: { title: string; url: string }[] = [];
        
        // UPDATED SELECTOR: Google's old class 'div.g' is no longer reliable.
        // This new selector finds anchor tags that directly contain an H3,
        // which is a more stable pattern for search result titles.
        $('a > h3').parent().each((i, element) => {
            const linkElement = $(element);
            const titleElement = linkElement.find('h3');
            
            const title = titleElement.text();
            let url = linkElement.attr('href');

            // Clean up the URL if it's a Google redirect link
            if (url?.startsWith('/url?q=')) {
                const urlParams = new URLSearchParams(url.split('?')[1]);
                url = urlParams.get('q') || url;
            }

            // Filter out irrelevant links (e.g., internal page links)
            if (title && url && !url.startsWith('#')) {
                citations.push({ title, url });
            }
        });

        // Use the title of the first result as the "answer"
        const answer = citations.length > 0 ? citations[0].title : 'No results found.';

        // Save to PostgreSQL
        try {
            const insertQuery = `
                INSERT INTO search_history (query, response, citations)
                VALUES ($1, $2, $3)
            `;
            const values = [query, answer, citations.slice(0, 5).map(c => c.url)];
            await pool.query(insertQuery, values);
        } catch (dbError) {
            console.error('Failed to save search history to PostgreSQL:', dbError);
        }

        res.json({ answer, citations: citations.slice(0, 5) });

    } catch (error) {
        console.error('Error fetching data from SERP API:', error);
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

