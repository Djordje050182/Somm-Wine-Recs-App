
import { WINERIES, WINES } from '../data/wineries';
import { FunctionDeclaration, Type } from "@google/genai";

// --- Event Dispatcher ---
export const dispatchStorageEvent = () => {
  window.dispatchEvent(new Event('somm-storage-update'));
};

// --- Helpers ---
const findWinery = (name: string) => {
  const n = name.toLowerCase();
  return WINERIES.find(w => w.name.toLowerCase().includes(n));
};

const findWine = (name: string) => {
  const n = name.toLowerCase();
  return WINES.find(w => w.name.toLowerCase().includes(n));
};

// --- Actions ---
export const addToPlanner = (wineryName: string): string => {
  const winery = findWinery(wineryName);
  if (!winery) return `I couldn't find a winery named "${wineryName}".`;

  // We operate on 'plannerIds' which ItineraryBuilder uses to generate the route
  const savedIds = JSON.parse(localStorage.getItem('plannerIds') || '[]');
  
  if (savedIds.includes(winery.id)) {
    return `${winery.name} is already in your planner.`;
  }
  
  if (savedIds.length >= 5) {
    return `Your planner is full (max 5 stops). Please remove one first.`;
  }

  savedIds.push(winery.id);
  localStorage.setItem('plannerIds', JSON.stringify(savedIds));
  dispatchStorageEvent();
  return `Added ${winery.name} to your planner.`;
};

export const addToFavorites = (name: string, type: 'winery' | 'wine'): string => {
  if (type === 'winery') {
    const w = findWinery(name);
    if (!w) return `Couldn't find winery "${name}".`;
    
    const saved = JSON.parse(localStorage.getItem('favWineries') || '[]');
    if (!saved.includes(w.id)) {
      saved.push(w.id);
      localStorage.setItem('favWineries', JSON.stringify(saved));
      dispatchStorageEvent();
      return `Saved ${w.name} to your cellar favorites.`;
    }
    return `${w.name} is already in your favorites.`;
  } else {
    const w = findWine(name);
    if (!w) return `Couldn't find wine "${name}".`;
    
    const saved = JSON.parse(localStorage.getItem('favWines') || '[]');
    if (!saved.includes(w.id)) {
      saved.push(w.id);
      localStorage.setItem('favWines', JSON.stringify(saved));
      dispatchStorageEvent();
      return `Added ${w.name} to your favorite wines.`;
    }
    return `${w.name} is already saved.`;
  }
};

// --- Tool Definitions for Gemini ---
export const toolsDef = [
  {
    functionDeclarations: [
      {
        name: 'addToPlanner',
        description: 'Add a specific winery to the user\'s trip planner/itinerary.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            wineryName: { type: Type.STRING, description: 'The exact or partial name of the winery.' }
          },
          required: ['wineryName']
        }
      },
      {
        name: 'addToFavorites',
        description: 'Save a wine or a winery to the user\'s personal favorites/cellar.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'The name of the wine or winery.' },
            type: { type: Type.STRING, description: 'Either "wine" or "winery".' }
          },
          required: ['name', 'type']
        }
      }
    ]
  }
];
