import express, { Request, Response } from 'express';
import axios from 'axios';
import { pool } from '../config/db';
import * as cheerio from 'cheerio';

export const searchRouter = express.Router();

const BRIGHT_DATA_URL = 'https://api.brightdata.com/request';
const SERP_API_ZONE = 'serp_api1';

// --- New Citation Type with Description ---
interface Citation {
  title: string;
  url: string;
  description: string; // Added description field
}

// POST /api/search
searchRouter.post('/', async (req: Request, res: Response) => {
    const { query } = req.body;
    const BRIGHT_DATA_API_KEY = process.env.BRIGHT_DATA_API_KEY;

    if (!query || !BRIGHT_DATA_API_KEY) {
        return res.status(400).json({ error: 'Query and API key are required.' });
    }

    try {
        console.log(`Making SERP API request for query: "${query}"`);

        const targetUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&gl=in&hl=en`;

        const response = await axios.post(
            BRIGHT_DATA_URL,
            { zone: SERP_API_ZONE, url: targetUrl, format: 'raw' },
            { headers: { 'Authorization': `Bearer ${BRIGHT_DATA_API_KEY}`, 'Content-Type': 'application/json' } }
        );

        const $ = cheerio.load(response.data);
        const citations: Citation[] = [];

        // --- UPDATED PARSING LOGIC ---
        // This selector is more robust and finds the container for each search result.
        $('div.g').each((i, element) => {
            const linkElement = $(element).find('a');
            const title = $(element).find('h3').text();
            let url = linkElement.attr('href');

            // Find the description snippet within the result block
            const description = $(element).find('div[style="-webkit-line-clamp:2"]').text();

            if (url?.startsWith('/url?q=')) {
                const urlParams = new URLSearchParams(url.split('?')[1]);
                url = urlParams.get('q') || url;
            }

            if (title && url && description) {
                citations.push({ title, url, description });
            }
        });

        const answer = citations.length > 0 
            ? `Based on the top results for your query, a key finding is: "${citations[0].title}". Here are more details:`
            : 'No results found.';

        try {
            const citationUrls = citations.slice(0, 5).map(c => c.url);
            await pool.query(
                'INSERT INTO search_history (query, response, citations) VALUES ($1, $2, $3)',
                [query, answer, citationUrls]
            );
        } catch (dbError) {
            console.error('Failed to save search history:', dbError);
        }

        res.json({ answer, citations: citations.slice(0, 5) });

    } catch (error) {
        console.error('Error fetching data from SERP API:', error);
        if (axios.isAxiosError(error) && error.response) {
            res.status(error.response.status).json({
                error: 'Failed to fetch data from the search API.',
                details: error.response.data
            });
        } else {
            res.status(500).json({ error: 'An unexpected server error occurred.' });
        }
    }
});