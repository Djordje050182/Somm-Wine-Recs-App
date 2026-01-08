
import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";
import { UserProfile } from '../types';
import { getWeatherContextString } from './weatherService';

// --- SECURITY CONFIGURATION ---
// ⚠️ SECURITY WARNING: 
// When false: API_KEY is exposed in the browser (Insecure, Dev only).
// When true: Calls are routed to /api/generate (Secure, requires server.js running).
const USE_SECURE_PROXY = false; 
const PROXY_BASE_URL = 'http://localhost:3000/api'; // Update this to your deployed server URL

// --- UTILITIES ---

const safeJsonParse = <T>(text: string, fallback: T): T => {
  if (!text) return fallback;
  try {
    let clean = text.replace(/```json\s*/g, "").replace(/```\s*/g, "");
    return JSON.parse(clean);
  } catch (e) {
    console.warn("JSON Parse Warning: Attempting repairs...", e);
    try {
        const firstOpen = text.indexOf('{');
        const lastClose = text.lastIndexOf('}');
        if (firstOpen !== -1 && lastClose !== -1) {
            const substring = text.substring(firstOpen, lastClose + 1);
            return JSON.parse(substring);
        }
    } catch (e2) {
        console.error("Critical JSON Parse Error.", e2);
    }
    return fallback;
  }
};

// Client Initialization (Only used if USE_SECURE_PROXY is false)
const getGeminiClient = () => {
  const key = process.env.API_KEY;
  if (!key) {
      console.error("API_KEY is missing.");
      throw new Error("Application configuration error: API Key missing.");
  }
  return new GoogleGenAI({ apiKey: key });
};

// --- PROXY HANDLER ---
const callGemini = async (params: { model: string, contents: any[], config?: any }) => {
    if (USE_SECURE_PROXY) {
        // SECURE PATH: Call our own backend
        const response = await fetch(`${PROXY_BASE_URL}/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
        });
        if (!response.ok) throw new Error("Proxy Server Error");
        return await response.json(); // Expected structure: { text: string }
    } else {
        // INSECURE PATH: Direct Client Call
        const ai = getGeminiClient();
        const response = await ai.models.generateContent({
            model: params.model,
            contents: params.contents,
            config: params.config
        });
        return { text: response.text, raw: response };
    }
};

// --- API FUNCTIONS ---

export const analyzeWineLabel = async (base64Image: string): Promise<string> => {
  try {
    const response = await callGemini({
      model: 'gemini-3-flash-preview',
      contents: [
          { parts: [
            { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
            { text: "Analyze this image. Is it a wine label? If NO, return JSON with 'isWine': false. If YES, identify producer, name, vintage, etc. Return pure JSON." }
          ]}
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isWine: { type: Type.BOOLEAN },
            producer: { type: Type.STRING },
            wineName: { type: Type.STRING },
            vintage: { type: Type.STRING },
            region: { type: Type.STRING },
            variety: { type: Type.STRING },
            sommelierNotes: { type: Type.STRING },
            pairings: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["isWine"]
        }
      }
    });
    
    return response.text || '{"isWine": false}';
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw new Error("Unable to analyze image. Please try again.");
  }
};

export const analyzeTastingMenu = async (base64Image: string, userProfile: UserProfile): Promise<string> => {
  try {
    const weatherContext = await getWeatherContextString();
    const prompt = `
      You are a personal AI Sommelier.
      USER PROFILE: Likes: ${userProfile.likes.join(', ')}, Dislikes: ${userProfile.dislikes.join(', ')}.
      CONTEXT: ${weatherContext}.
      TASK: Read the menu. Identify wines. Score them 0-100 based on the profile.
      Output JSON.
    `;

    const response = await callGemini({
      model: 'gemini-3-flash-preview',
      contents: [
          { parts: [
            { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
            { text: prompt }
          ]}
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            wines: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  wineName: { type: Type.STRING },
                  matchScore: { type: Type.NUMBER },
                  reasoning: { type: Type.STRING },
                  flavorTags: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["wineName", "matchScore", "reasoning", "flavorTags"]
              }
            }
          }
        }
      }
    });

    return response.text || '{}';
  } catch (error) {
    console.error("Menu Analysis Failed:", error);
    return JSON.stringify({ wines: [] }); 
  }
};

export const generateInsiderGuide = async (name: string, type: string, details: string): Promise<string> => {
  try {
    const prompt = `Create an Insider's Guide for ${type}: "${name}". Details: ${details}. Return JSON with icebreaker, proMove, hiddenGem.`;

    const response = await callGemini({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            icebreaker: { type: Type.STRING },
            proMove: { type: Type.STRING },
            hiddenGem: { type: Type.STRING }
          },
          required: ["icebreaker", "proMove", "hiddenGem"]
        }
      }
    });

    return response.text || '{}';
  } catch (error) {
    return JSON.stringify({
        icebreaker: `Ask the staff about the history of ${name}.`,
        proMove: "Book in advance for weekends.",
        hiddenGem: "This spot is a local favorite."
    });
  }
};

export const generateTripItinerary = async (days: number, groupType: string, vibe: string, knownWineries: string[]): Promise<string> => {
  const weatherContext = await getWeatherContextString();
  const prompt = `
    Create a ${days}-day Hunter Valley Itinerary for ${groupType} (${vibe}).
    CONTEXT: ${weatherContext}.
    USE ONLY THESE WINERIES: ${knownWineries.join(', ')}.
    Output pure JSON matching the schema.
  `;

  try {
      const response = await callGemini({
        model: 'gemini-3-pro-preview',
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          thinkingConfig: { thinkingBudget: 4000 },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              tripName: { type: Type.STRING },
              summary: { type: Type.STRING },
              days: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    dayTitle: { type: Type.STRING },
                    activities: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          time: { type: Type.STRING },
                          activity: { type: Type.STRING },
                          type: { type: Type.STRING }, 
                          description: { type: Type.STRING }
                        },
                        required: ["time", "activity", "type", "description"]
                      }
                    }
                  },
                  required: ["dayTitle", "activities"]
                }
              }
            },
            required: ["tripName", "summary", "days"]
          }
        }
      });

      return response.text || '{}';
  } catch (error) {
      console.error("Itinerary Generation Error", error);
      throw new Error("Unable to plan trip. Please reduce the number of days or try again.");
  }
};

export const generateTrailArt = async (wineryNames: string[]): Promise<string> => {
  const prompt = `Watercolor illustrated map: HUNTER VALLEY WINE RAMBLE. Wineries: ${wineryNames.join(', ')}. 16:9 ratio.`;
  
  if (USE_SECURE_PROXY) {
      try {
          const response = await fetch(`${PROXY_BASE_URL}/generate-image`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt, aspectRatio: "16:9" })
          });
          const data = await response.json();
          return data.imageUrl || '';
      } catch (e) {
          return '';
      }
  }

  // Insecure Fallback
  try {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts: [{ text: prompt }] }],
        config: { imageConfig: { aspectRatio: "16:9" } }
      });

      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return '';
  } catch (e) {
      return '';
  }
};

export const generateReviewSummary = async (wineryName: string): Promise<string> => {
  const prompt = `Community Pulse for "${wineryName}". Score Service/Atmosphere/Value (0-5). Summary. Frequent Mentions. JSON.`;

  try {
      const response = await callGemini({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              serviceScore: { type: Type.NUMBER },
              atmosphereScore: { type: Type.NUMBER },
              valueScore: { type: Type.NUMBER },
              summary: { type: Type.STRING },
              frequentMentions: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["serviceScore", "atmosphereScore", "valueScore", "summary", "frequentMentions"]
          }
        }
      });
      return response.text || '{}';
  } catch (e) {
      return JSON.stringify({
          serviceScore: 0, atmosphereScore: 0, valueScore: 0, 
          summary: "Reviews currently unavailable.", frequentMentions: []
      });
  }
};

export const getCoordinatesForLocation = async (locationName: string): Promise<{ lat: number, lng: number, name: string }> => {
  const prompt = `Coordinates for "${locationName}" in Hunter Valley NSW. Return JSON lat/lng/name. Default to Pokolbin if unknown.`;
  
  try {
      const response = await callGemini({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: { lat: { type: Type.NUMBER }, lng: { type: Type.NUMBER }, name: { type: Type.STRING } },
            required: ["lat", "lng", "name"]
          }
        }
      });
      return safeJsonParse(response.text || '{}', { lat: -32.7850, lng: 151.3150, name: 'Pokolbin Central (Default)' });
  } catch (e) {
      return { lat: -32.7850, lng: 151.3150, name: 'Pokolbin Central (Default)' };
  }
};

export const searchLocalEvents = async (): Promise<{events: any[], groundingMetadata: any}> => {
  const prompt = `Upcoming events in Hunter Valley NSW (next 4 weeks). JSON array: title, date, location, category, description, link.`;

  try {
      const response = await callGemini({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: prompt }] }],
        config: { tools: [{googleSearch: {}}] }
      });

      // Note: Proxy might return different structure for groundingMetadata depending on implementation
      // Here we assume consistent structure or fallback
      const text = response.text || '';
      const events = safeJsonParse(text, []);
      
      let groundingMetadata = null;
      // If using raw client, we get candidates. If using proxy, check response structure.
      if (!USE_SECURE_PROXY) {
          // @ts-ignore
          groundingMetadata = response.raw?.candidates?.[0]?.groundingMetadata;
      }

      return {
          events: Array.isArray(events) ? events : [],
          groundingMetadata
      };
  } catch (e) {
      return { events: [], groundingMetadata: null };
  }
};

// ... (Audio Helpers remain unchanged) ...
export function encodeAudio(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decodeAudio(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
