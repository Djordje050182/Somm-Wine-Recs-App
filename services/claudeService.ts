// Claude AI service — all AI calls go through a Cloudflare Worker proxy.
// The proxy URL comes from VITE_AI_PROXY_URL env var; if absent, AI features are disabled.

const PROXY_URL = (typeof process !== 'undefined' && process.env?.VITE_AI_PROXY_URL) || 
                  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_AI_PROXY_URL);

export const isAIEnabled = (): boolean => !!PROXY_URL;

const MODEL = 'claude-sonnet-4-6';

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

async function callClaude(
  messages: ClaudeMessage[],
  system?: string,
  maxTokens = 1024
): Promise<string> {
  if (!PROXY_URL) throw new Error('AI proxy not configured');

  const res = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, system, messages, max_tokens: maxTokens }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`AI proxy error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text ?? '';
}

async function callClaudeJSON<T>(
  messages: ClaudeMessage[],
  system?: string,
  maxTokens = 2048
): Promise<T> {
  const text = await callClaude(messages, system, maxTokens);
  const match = text.match(/```json\s*([\s\S]*?)```/) ?? text.match(/(\{[\s\S]*\})/);
  const jsonStr = match ? match[1] : text;
  return JSON.parse(jsonStr.trim());
}

const SOMMELIER_SYSTEM = `You are a Master Sommelier with 20 years of experience specialising in the Hunter Valley, NSW, Australia. 
You have deep knowledge of Tyrrell's, Brokenwood, Audrey Wilkinson, and all major Hunter Valley producers.
You speak with warmth, authority, and a love for food, wine, and regional tourism.
Keep answers concise, insightful, and practical. When recommending wines, include food pairings.`;

export const sommelierChat = async (
  userMessage: string,
  history: ClaudeMessage[] = [],
  context = ''
): Promise<string> => {
  const system = SOMMELIER_SYSTEM + (context ? `\n\nContext: ${context}` : '');
  return callClaude([...history, { role: 'user', content: userMessage }], system, 1024);
};

export const generateTripItinerary = async (
  days: number,
  group: string,
  vibe: string,
  wineryNames: string[]
) => {
  const system = SOMMELIER_SYSTEM;
  const prompt = `Create a ${days}-day wine tour itinerary in the Hunter Valley for: ${group}, vibe: ${vibe}.
Available wineries: ${wineryNames.join(', ')}.
Return ONLY valid JSON (no markdown fences) matching this shape:
{
  "tripName": "string",
  "summary": "string",
  "days": [{
    "dayTitle": "string",
    "activities": [{
      "time": "string",
      "activity": "string",
      "description": "string",
      "type": "winery|dining|experience|travel"
    }]
  }]
}`;
  return callClaudeJSON<any>([{ role: 'user', content: prompt }], system, 3000);
};

export const analyzeWineLabel = async (base64Image: string): Promise<{
  isWine: boolean;
  wineName?: string;
  producer?: string;
  vintage?: string;
  variety?: string;
  sommelierNotes?: string;
  foodPairings?: string[];
  cellarPotential?: string;
  wineId?: string;
}> => {
  if (!PROXY_URL) throw new Error('AI proxy not configured');

  const res = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: SOMMELIER_SYSTEM,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64Image } },
          { type: 'text', text: `Analyze this wine label image. Return ONLY valid JSON (no markdown):
{
  "isWine": boolean,
  "wineName": "string or null",
  "producer": "string or null",
  "vintage": "string or null",
  "variety": "string or null",
  "sommelierNotes": "2-3 sentence tasting note",
  "foodPairings": ["food1", "food2", "food3"],
  "cellarPotential": "e.g. Drink now or cellar 5-10 years"
}` }
        ]
      }]
    }),
  });

  if (!res.ok) throw new Error('Vision analysis failed');
  const data = await res.json();
  const text = data.content?.[0]?.text ?? '{}';
  const match = text.match(/```json\s*([\s\S]*?)```/) ?? text.match(/(\{[\s\S]*\})/);
  return JSON.parse((match ? match[1] : text).trim());
};

export const getFoodPairings = async (
  wineName: string,
  variety: string,
  notes: string
): Promise<{ pairings: Array<{ food: string; reason: string; emoji: string }> }> => {
  const prompt = `For the wine "${wineName}" (${variety}): ${notes}
Return ONLY valid JSON with 6 food pairings:
{"pairings":[{"food":"string","reason":"one sentence","emoji":"single emoji"}]}`;
  return callClaudeJSON([{ role: 'user', content: prompt }], SOMMELIER_SYSTEM, 800);
};

export const generateInsiderGuide = async (
  name: string,
  type: string,
  details: string
): Promise<{ icebreaker: string; proMove: string; hiddenGem: string }> => {
  const prompt = `Generate an insider guide for ${name} (${type}) in the Hunter Valley. Context: ${details}.
Return ONLY valid JSON:
{"icebreaker":"string","proMove":"string","hiddenGem":"string"}`;
  return callClaudeJSON([{ role: 'user', content: prompt }], SOMMELIER_SYSTEM, 600);
};

export const generateReviewSummary = async (name: string): Promise<{
  serviceScore: number;
  atmosphereScore: number;
  valueScore: number;
  summary: string;
  frequentMentions: string[];
}> => {
  const prompt = `Generate a realistic community review summary for ${name} winery in Hunter Valley.
Return ONLY valid JSON:
{"serviceScore":number,"atmosphereScore":number,"valueScore":number,"summary":"string","frequentMentions":["string"]}`;
  return callClaudeJSON([{ role: 'user', content: prompt }], SOMMELIER_SYSTEM, 600);
};

export const getVintageReport = async (winery: string, year?: number): Promise<string> => {
  const y = year ?? new Date().getFullYear() - 1;
  return callClaude(
    [{ role: 'user', content: `Give me a concise vintage report for ${winery} in ${y} Hunter Valley season. 3-4 sentences.` }],
    SOMMELIER_SYSTEM,
    400
  );
};

export const getCellarAdvice = async (
  wines: Array<{ name: string; variety: string; vintage: string; quantity: number }>
): Promise<string> => {
  const list = wines.map(w => `${w.quantity}x ${w.vintage} ${w.name} (${w.variety})`).join(', ');
  return callClaude(
    [{ role: 'user', content: `I have these wines in my cellar: ${list}. Give me a drinking window plan and any urgent drink-now recommendations. Be concise.` }],
    SOMMELIER_SYSTEM,
    600
  );
};

export const searchEvents = async (): Promise<Array<{
  title: string;
  category: string;
  date: string;
  location: string;
  description: string;
}>> => {
  const result = await callClaudeJSON<{ events: any[] }>(
    [{ role: 'user', content: `List 8 types of events and festivals that typically happen in Hunter Valley wine country throughout the year. Include harvest festival, winemaker dinners, jazz in the vines, etc. Make dates realistic for 2025-2026.
Return ONLY valid JSON: {"events":[{"title":"string","category":"string","date":"string","location":"string","description":"string"}]}` }],
    SOMMELIER_SYSTEM,
    1200
  );
  return result.events ?? [];
};
