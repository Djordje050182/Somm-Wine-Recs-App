
/**
 * SECURE BACKEND PROXY
 * 
 * To secure your API Key:
 * 1. Deploy this file to a server (Node.js environment).
 * 2. Set your API_KEY as an environment variable on that server.
 * 3. In `services/geminiService.ts`, set `USE_SECURE_PROXY = true`.
 */

import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize Gemini SDK Server-Side
// The API Key here is safe because this code runs on the server, not the browser.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Allow large image payloads

// --- GENERIC GENERATE CONTENT ENDPOINT ---
app.post('/api/generate', async (req, res) => {
  try {
    const { model, contents, config } = req.body;

    const response = await ai.models.generateContent({
      model: model || 'gemini-3-flash-preview',
      contents: contents,
      config: config
    });

    // Send the raw text or full response back to client
    res.json({ 
        text: response.text, 
        candidates: response.candidates 
    });

  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// --- SPECIFIC ENDPOINT FOR IMAGEN (Trail Art) ---
app.post('/api/generate-image', async (req, res) => {
    try {
      const { prompt, aspectRatio } = req.body;
  
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts: [{ text: prompt }] }],
        config: { imageConfig: { aspectRatio: aspectRatio || "16:9" } }
      });
  
      // Extract base64
      const parts = response.candidates?.[0]?.content?.parts || [];
      let imageBase64 = '';
      for (const part of parts) {
        if (part.inlineData) {
            imageBase64 = `data:image/png;base64,${part.inlineData.data}`;
            break;
        }
      }
  
      res.json({ imageUrl: imageBase64 });
  
    } catch (error) {
      console.error('Imagen API Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

app.listen(port, () => {
  console.log(`Somm Secure Server running on port ${port}`);
});
