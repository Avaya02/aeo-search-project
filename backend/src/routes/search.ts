// File: backend/src/routes/search.ts (The Final, Definitive Version)

import express, { Request, Response } from 'express';
import axios from 'axios';
import { pool } from '../config/db';
// ======================================================================
//  <<< --- CHEERIO IS NO LONGER NEEDED --- >>>
// ======================================================================
// import * as cheerio from 'cheerio'; 
import { GoogleGenerativeAI } from '@google/generative-ai';


export const searchRouter = express.Router();

// ======================================================================
//  <<< --- THE NEW, RELIABLE BRIGHT DATA SERP API ENDPOINT --- >>>
// ======================================================================
const BRIGHT_DATA_SERP_URL = 'https://api.brightdata.com/serp/req';
const GEMINI_MODEL_TO_USE = 'gemini-1.5-flash';

// ==============================================================================
//  HELPER FUNCTION: Using the Official Google AI Client (This code is perfect)
// ==============================================================================
async function getAiSummary(query: string, searchContext: string): Promise<string> {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
        return "Could not generate an AI summary due to a server configuration error.";
    }
    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: GEMINI_MODEL_TO_USE });
        const prompt = `Based *only* on the following search results context, provide a helpful and descriptive answer to the user's query. The answer should be a concise paragraph written in a neutral, informative tone. Do not mention "based on the search results" or list the sources in your answer. Just provide the answer directly. User Query: "${query}" Search Results Context:\n---\n${searchContext}\n---`;
        
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("--- ERROR CALLING GOOGLE AI LIBRARY ---", error);
        return "Failed to generate an AI-powered answer at this time.";
    }
}

// ==============================================================================
//  MAIN SEARCH ENDPOINT (Rewritten to use the SERP API)
// ==============================================================================
searchRouter.post('/', async (req: Request, res: Response) => {
    const { query } = req.body;
    const BRIGHT_DATA_API_KEY = process.env.BRIGHT_DATA_API_KEY;
    if (!query || !BRIGHT_DATA_API_KEY) return res.status(500).json({ error: 'Server not configured.' });

    try {
        console.log(`[Step 1] Calling Bright Data SERP API for query: "${query}"`);
        
        // ======================================================================
        //  <<< --- THIS IS THE NEW API CALL --- >>>
        //  We send the query directly. No more raw HTML.
        // ======================================================================
        const serpResponse = await axios.post(
            BRIGHT_DATA_SERP_URL,
            {
                country: 'IN', // For India-specific results
                q: query
            },
            {
                headers: { 
                    'Authorization': `Bearer ${BRIGHT_DATA_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('[Step 2] Processing structured JSON response...');
        
        // The response.data is now a structured JSON object. We look for the 'organic' results array.
        const organicResults = serpResponse.data?.organic || [];

        // We map the clean JSON results directly. No Cheerio needed.
        const searchResults = organicResults.slice(0, 5).map((result: any) => ({
            title: result.title,
            url: result.link,
            snippet: result.snippet
        }));

        if (searchResults.length === 0) {
            console.warn("Bright Data SERP API returned 0 organic results.");
            return res.json({ answer: "Sorry, I couldn't find any relevant results for that query.", citations: [] });
        }

        console.log(`[Step 3] Found ${searchResults.length} results. Creating AI context...`);
        const searchContext = searchResults.map(r => `Title: ${r.title}\nSnippet: ${r.snippet}`).join('\n\n');
        
        console.log(`[Step 4] Calling official Google AI client ('${GEMINI_MODEL_TO_USE}')...`);
        const aiAnswer = await getAiSummary(query, searchContext);
        
        const citations = searchResults.map(r => ({ title: r.title, url: r.url }));

        try {
            await pool.query('INSERT INTO search_history (query, response, citations) VALUES ($1, $2, $3)', [query, aiAnswer, citations.map(c => c.url)]);
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