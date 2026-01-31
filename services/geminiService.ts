
import { GoogleGenAI, Type, Modality } from "@google/genai";

// --- CORE UTILS ---

// Using process.env.API_KEY as per the guidelines.
const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: AIzaSyARQhkNVq4wOI8CdEeHxzPIqCc4EeinVqc });
};

// --- GENERATION FUNCTIONS ---

// Updated to use the correct model name and config structure for gemini-3-pro-image-preview.
export const generateProImage = async (prompt: string, aspectRatio: string = "1:1", imageSize: string = "1K") => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any,
        imageSize: imageSize as any
      }
    }
  });

  const candidates = response.candidates || [];
  for (const candidate of candidates) {
    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }
  throw new Error("No image generated");
};

// Updated to use the correct model for image editing.
export const editImageWithPrompt = async (base64Image: string, prompt: string) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
        { text: prompt }
      ]
    }
  });

  const candidates = response.candidates || [];
  for (const candidate of candidates) {
    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }
  throw new Error("Editing failed");
};

// Updated video generation with proper operation polling and download link fetching.
export const generateVeoVideo = async (prompt: string, imageBase64?: string, aspectRatio: "16:9" | "9:16" = "16:9") => {
  const ai = getGeminiClient();
  const config = {
    numberOfVideos: 1,
    resolution: '720p',
    aspectRatio
  };

  const videoParams: any = {
    model: 'veo-3.1-fast-generate-preview',
    prompt,
    config
  };

  if (imageBase64) {
    videoParams.image = {
      imageBytes: imageBase64,
      mimeType: 'image/jpeg'
    };
  }

  let operation = await ai.models.generateVideos(videoParams);
  
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  return `${downloadLink}&key=${process.env.API_KEY}`;
};

// Correctly use Modality.AUDIO and return the extracted audio data.
export const generateSpeech = async (text: string) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  return base64Audio;
};

// Added missing analyzeWineLabel for vision-based wine identification.
export const analyzeWineLabel = async (base64: string) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64, mimeType: 'image/jpeg' } },
        { text: "Analyze this wine label. Return a JSON object with: isWine (boolean), wineName, producer, sommelierNotes. If not a wine label, set isWine to false." }
      ]
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isWine: { type: Type.BOOLEAN },
          wineName: { type: Type.STRING },
          producer: { type: Type.STRING },
          sommelierNotes: { type: Type.STRING }
        },
        required: ['isWine']
      }
    }
  });
  return response.text;
};

// Added missing generateTrailArt for map souvenir generation.
export const generateTrailArt = async (wineryNames: string[]) => {
  const ai = getGeminiClient();
  const prompt = `A beautiful, whimsical, and artistic map-style illustration of a wine trail in the Hunter Valley, specifically highlighting these locations: ${wineryNames.join(', ')}. No text labels, just symbolic icons for vineyards, barrels, and landscapes.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        aspectRatio: "16:9"
      }
    }
  });

  const candidates = response.candidates || [];
  for (const candidate of candidates) {
    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }
  throw new Error("Trail art generation failed");
};

// Added missing getCoordinatesForLocation utility.
export const getCoordinatesForLocation = async (locationName: string) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Find the approximate latitude and longitude for the location: ${locationName} in the Hunter Valley, NSW. Return as JSON.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          lat: { type: Type.NUMBER },
          lng: { type: Type.NUMBER }
        },
        required: ['name', 'lat', 'lng']
      }
    }
  });
  return JSON.parse(response.text);
};

// Added missing generateInsiderGuide for winery info modals.
export const generateInsiderGuide = async (name: string, type: string, details: string) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate an insider guide for ${name} (${type}). Context: ${details}. Include an icebreaker, a pro move, and a hidden gem.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          icebreaker: { type: Type.STRING },
          proMove: { type: Type.STRING },
          hiddenGem: { type: Type.STRING }
        },
        required: ['icebreaker', 'proMove', 'hiddenGem']
      }
    }
  });
  return response.text;
};

// Added missing generateReviewSummary for community sentiment analysis.
export const generateReviewSummary = async (name: string) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a community pulse summary for ${name}. Include service, atmosphere, and value scores (out of 5), a summary of opinions, and frequent mentions.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          serviceScore: { type: Type.NUMBER },
          atmosphereScore: { type: Type.NUMBER },
          valueScore: { type: Type.NUMBER },
          summary: { type: Type.STRING },
          frequentMentions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['serviceScore', 'atmosphereScore', 'valueScore', 'summary', 'frequentMentions']
      }
    }
  });
  return response.text;
};

// Added missing generateTripItinerary for complex multi-day planning.
export const generateTripItinerary = async (days: number, group: string, vibe: string, wineryNames: string[]) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Create a ${days}-day itinerary for a ${group} with a ${vibe} vibe in the Hunter Valley. Use these wineries as primary options: ${wineryNames.join(', ')}. Include arrival times and descriptions.`,
    config: {
      responseMimeType: 'application/json',
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
                      description: { type: Type.STRING },
                      type: { type: Type.STRING }
                    }
                  }
                }
              }
            }
          }
        },
        required: ['tripName', 'summary', 'days']
      }
    }
  });
  return response.text;
};

// Added missing searchLocalEvents using Google Search grounding.
export const searchLocalEvents = async () => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: 'Find current and upcoming events, concerts, and festivals in the Hunter Valley, NSW for 2025. Return as a list of events with title, category, date, location, description, and link.',
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          events: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                category: { type: Type.STRING },
                date: { type: Type.STRING },
                location: { type: Type.STRING },
                description: { type: Type.STRING },
                link: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });
  
  return {
    events: JSON.parse(response.text).events || [],
    groundingMetadata: response.candidates?.[0]?.groundingMetadata
  };
};

export const transcribeAudio = async (base64Audio: string) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{
      parts: [
        { inlineData: { data: base64Audio, mimeType: 'audio/wav' } },
        { text: "Transcribe this audio clip accurately." }
      ]
    }]
  });
  return response.text;
};

// --- ENHANCED ANALYSIS ---

export const analyzeVideoContent = async (base64Data: string, prompt: string) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [{
      parts: [
        { inlineData: { data: base64Data, mimeType: 'video/mp4' } },
        { text: prompt }
      ]
    }]
  });
  return response.text;
};

export const deepSommelierQuery = async (query: string, context: string) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: query,
    config: {
      systemInstruction: `You are a Master Sommelier with advanced reasoning capabilities. Use the following context: ${context}`,
      thinkingConfig: { thinkingBudget: 32768 },
      tools: [{ googleSearch: {} }]
    }
  });

  return {
    text: response.text,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

export const fastResponse = async (prompt: string) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite-latest',
    contents: prompt
  });
  return response.text;
};

// --- AUDIO HELPERS ---

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
