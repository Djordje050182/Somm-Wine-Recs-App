// Claude AI service — all AI calls go through a Cloudflare Worker proxy.
// The proxy URL comes from VITE_AI_PROXY_URL env var; if absent, AI features are disabled.
// Every function is region-parameterised: pass the active Region from useRegion().

import { Region } from '../types';

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

const sommelierSystem = (region: Region): string =>
  `You are the Somm — a Master Sommelier with twenty years of experience specialising in ${region.name}, ${region.state}, ${region.country}.
${region.ai.sommelierPersona}
You know ${region.ai.signatureProducers.join(', ')} and every serious producer in the region personally.
${region.ai.promptContext}
Write in British English. Never use emoji. Keep answers concise, insightful and practical. When recommending wines, include food pairings.`;

export const sommelierChat = async (
  region: Region,
  userMessage: string,
  history: ClaudeMessage[] = [],
  context = ''
): Promise<string> => {
  const system = sommelierSystem(region) + (context ? `\n\nContext: ${context}` : '');
  return callClaude([...history, { role: 'user', content: userMessage }], system, 1024);
};

export interface TripCandidate {
  name: string;
  kind: 'winery' | 'experience';
  notes: string; // compact attributes: specialty, kid/dog-friendly, restaurant, fee
}

export const generateTripItinerary = async (
  region: Region,
  days: number,
  group: string,
  vibe: string,
  style: string,
  budget: string,
  freeText: string,
  candidates: TripCandidate[]
) => {
  const list = candidates.map(c => `- ${c.name} (${c.kind}): ${c.notes}`).join('\n');
  const prompt = `Create a ${days}-day wine tour itinerary in ${region.name}.
Party: ${group}. Mood: ${vibe}. Wine style: ${style}. Budget: ${budget}.
${freeText ? `In the guest's own words: "${freeText}". Honour this above everything else.` : ''}
Choose ONLY from these real places (respect kid-friendliness if children are coming, wine styles, and budget):
${list}

Return ONLY valid JSON (no markdown fences) matching this shape:
{
  "tripName": "string",
  "summary": "string — two warm sentences, no clichés",
  "stops": ["exact place names for day 1 in visiting order, 3 to 5 of them, include one lunch spot if the day wants one"],
  "days": [{
    "dayTitle": "string",
    "activities": [{
      "time": "string",
      "activity": "string — must reference the real place by its exact name",
      "description": "string",
      "type": "winery|dining|experience|travel"
    }]
  }]
}
"stops" must contain exact names from the list above, nothing invented.`;
  return callClaudeJSON<any>([{ role: 'user', content: prompt }], sommelierSystem(region), 3000);
};

export const analyzeWineLabel = async (region: Region, base64Image: string): Promise<{
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
      system: sommelierSystem(region),
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64Image } },
          { type: 'text', text: `Analyse this wine label image. Return ONLY valid JSON (no markdown):
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
  region: Region,
  wineName: string,
  variety: string,
  notes: string
): Promise<{ pairings: Array<{ food: string; reason: string }> }> => {
  const prompt = `For the wine "${wineName}" (${variety}): ${notes}
Return ONLY valid JSON with 6 food pairings:
{"pairings":[{"food":"string","reason":"one sentence"}]}`;
  return callClaudeJSON([{ role: 'user', content: prompt }], sommelierSystem(region), 800);
};

export const generateInsiderGuide = async (
  region: Region,
  name: string,
  type: string,
  details: string
): Promise<{ icebreaker: string; proMove: string; hiddenGem: string }> => {
  const prompt = `Generate an insider guide for ${name} (${type}) in ${region.name}. Context: ${details}.
Return ONLY valid JSON:
{"icebreaker":"string","proMove":"string","hiddenGem":"string"}`;
  return callClaudeJSON([{ role: 'user', content: prompt }], sommelierSystem(region), 600);
};

export const generateReviewSummary = async (region: Region, name: string): Promise<{
  serviceScore: number;
  atmosphereScore: number;
  valueScore: number;
  summary: string;
  frequentMentions: string[];
}> => {
  const prompt = `Generate a realistic community review summary for ${name} winery in ${region.name}.
Return ONLY valid JSON:
{"serviceScore":number,"atmosphereScore":number,"valueScore":number,"summary":"string","frequentMentions":["string"]}`;
  return callClaudeJSON([{ role: 'user', content: prompt }], sommelierSystem(region), 600);
};

export const getVintageReport = async (region: Region, winery: string, year?: number): Promise<string> => {
  const y = year ?? new Date().getFullYear() - 1;
  return callClaude(
    [{ role: 'user', content: `Give me a concise vintage report for ${winery} in the ${y} ${region.name} season. 3-4 sentences.` }],
    sommelierSystem(region),
    400
  );
};

export const getCellarAdvice = async (
  region: Region,
  wines: Array<{ name: string; variety: string; vintage: string; quantity: number }>
): Promise<string> => {
  const list = wines.map(w => `${w.quantity}x ${w.vintage} ${w.name} (${w.variety})`).join(', ');
  return callClaude(
    [{ role: 'user', content: `I have these wines in my cellar: ${list}. Give me a drinking window plan and any urgent drink-now recommendations. Be concise.` }],
    sommelierSystem(region),
    600
  );
};

export const searchEvents = async (region: Region): Promise<Array<{
  title: string;
  category: string;
  date: string;
  location: string;
  description: string;
}>> => {
  const result = await callClaudeJSON<{ events: any[] }>(
    [{ role: 'user', content: `List 8 types of events and festivals that typically happen in ${region.name} wine country throughout the year. Include harvest festivals, winemaker dinners, music in the vines, and the like. Make dates realistic for the coming twelve months.
Return ONLY valid JSON: {"events":[{"title":"string","category":"string","date":"string","location":"string","description":"string"}]}` }],
    sommelierSystem(region),
    1200
  );
  return result.events ?? [];
};
