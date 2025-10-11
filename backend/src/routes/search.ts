import express, { Request, Response } from 'express';
import axios from 'axios';
import { pool } from '../config/db';
import * as cheerio from 'cheerio';

export const searchRouter = express.Router();

// --- Configuration Constants ---
const BRIGHT_DATA_URL = 'https://api.brightdata.com/request';
const SERP_API_ZONE = 'serp_api1';

// ======================================================================
//  <<< --- THIS IS THE FINAL FIX, BASED ON YOUR TERMINAL OUTPUT --- >>>
//  We are now using the exact model name that your project confirmed
//  it has access to. This will resolve the 404 error.
// ======================================================================
const GEMINI_MODEL_TO_USE = 'gemini-2.5-pro-preview-03-25';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL_TO_USE}:generateContent`;

// ==============================================================================
//  HELPER FUNCTION: GET AI SUMMARY
// ==============================================================================
async function getAiSummary(query: string, searchContext: string): Promise<string> {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
        console.error("Gemini API key is missing from .env file.");
        return "Could not generate an AI summary due to a server configuration error.";
    }

    const prompt = `
        Based *only* on the following search results context, provide a helpful and descriptive answer to the user's query.
        The answer should be a concise paragraph written in a neutral, informative tone.
        Do not mention "based on the search results" or list the sources in your answer. Just provide the answer directly.

        User Query: "${query}"

        Search Results Context:
        ---
        ${searchContext}
        ---
    `;

    try {
        const response = await axios.post(
            `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
            { contents: [{ parts: [{ text: prompt }] }] },
            { headers: { 'Content-Type': 'application/json' } }
        );

        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
        
        console.error("Invalid response structure from Gemini API:", response.data);
        return "The AI model returned an unexpected response format.";

    } catch (error) {
        console.error("--- ERROR CALLING GEMINI API ---");
        if (axios.isAxiosError(error) && error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Error:", error);
        }
        return "Failed to generate an AI-powered answer at this time.";
    }
}

// ==============================================================================
//  MAIN SEARCH ENDPOINT
// ==============================================================================
searchRouter.post('/', async (req: Request, res: Response) => {
    const { query } = req.body;
    const BRIGHT_DATA_API_KEY = process.env.BRIGHT_DATA_API_KEY;

    if (!query) return res.status(400).json({ error: 'Query is required.' });
    if (!BRIGHT_DATA_API_KEY) return res.status(500).json({ error: 'Server configuration error: Missing Bright Data API key.' });

    try {
        console.log(`[Step 1] Scraping Google for query: "${query}"`);
        const targetUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&gl=in&hl=en`;

        const serpResponse = await axios.post(
            BRIGHT_DATA_URL,
            { zone: SERP_API_ZONE, url: targetUrl, format: 'raw' },
            { headers: { 'Authorization': `Bearer ${BRIGHT_DATA_API_KEY}` } }
        );

        console.log('[Step 2] Parsing HTML response...');
        const $ = cheerio.load(serpResponse.data);
        const searchResults: { title: string; url: string; snippet: string }[] = [];

        $('div.MjjYud').each((i, element) => {
            const linkElement = $(element).find('a[jsname="UWckNb"]');
            const title = linkElement.find('h3').text();
            const url = linkElement.attr('href');
            const snippet = $(element).find('div.VwiC3b').text();

            if (title && url && snippet && !url.startsWith('#') && searchResults.length < 5) {
                searchResults.push({ title, url, snippet });
            }
        });

        if (searchResults.length === 0) {
            console.warn("Cheerio scraper found 0 results. Google's HTML structure may have changed.");
            return res.json({ answer: "Sorry, I couldn't find any relevant results for that query.", citations: [] });
        }

        console.log(`[Step 3] Found ${searchResults.length} results. Creating AI context...`);
        const searchContext = searchResults.map(r => `Title: ${r.title}\nSnippet: ${r.snippet}`).join('\n\n');

        console.log(`[Step 4] Calling Gemini API ('${GEMINI_MODEL_TO_USE}') for a descriptive answer...`);
        const aiAnswer = await getAiSummary(query, searchContext);

        console.log('[Step 5] Saving result to PostgreSQL...');
        const citations = searchResults.map(r => ({ title: r.title, url: r.url }));
        try {
            await pool.query(
                'INSERT INTO search_history (query, response, citations) VALUES ($1, $2, $3)',
                [query, aiAnswer, citations.map(c => c.url)]
            );
        } catch (dbError) {
            console.error('Failed to save search history:', dbError);
        }

        console.log('[Step 6] Sending final response to frontend.');
        res.json({ answer: aiAnswer, citations });

    } catch (error) {
        console.error('An error occurred in the main search endpoint:', error);
        res.status(500).json({ error: 'An unexpected server error occurred.' });
    }
});