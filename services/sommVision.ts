// Label reading through the ElevenLabs agent — a text-only session that
// borrows a vision-capable model (the per-session LLM override) so the
// scanner works without the Claude proxy. The voice Somm keeps its own model;
// this is a private word with a sharper-eyed cousin.
//
// Loaded lazily: the client SDK only ships to the browser when a label is
// actually scanned.

const AGENT_ID = 'agent_7301kwh2rqsjeapresnmn56tcrwd';
const VISION_LLM = 'gemini-2.5-flash';
const TIMEOUT_MS = 60_000;

export interface LabelAnalysis {
  isWine: boolean;
  wineName?: string;
  producer?: string;
  vintage?: string;
  variety?: string;
  sommelierNotes?: string;
  foodPairings?: string[];
  cellarPotential?: string;
}

const INSTRUCTION = `Look at the attached photograph of a bottle. Ignore every rule about spoken style for this one reply: respond with ONLY a valid JSON object, no other words, matching exactly:
{"isWine": boolean, "wineName": "string or null", "producer": "string or null", "vintage": "string or null", "variety": "string or null", "sommelierNotes": "2-3 sentence tasting note in your voice", "foodPairings": ["food1","food2","food3"], "cellarPotential": "e.g. Drink now, or cellar 5-10 years"}
If the photo is not a wine bottle, set isWine to false and leave the rest null.`;

export async function analyzeLabelViaAgent(imageBlob: Blob): Promise<LabelAnalysis> {
  const { Conversation } = await import('@elevenlabs/client');

  return new Promise<LabelAnalysis>((resolve, reject) => {
    let conversation: any = null;
    let responses = 0;
    let settled = false;

    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      fn();
      conversation?.endSession().catch(() => undefined);
    };

    const timer = setTimeout(
      () => finish(() => reject(new Error('The Somm squinted at it for too long — try a clearer shot.'))),
      TIMEOUT_MS
    );

    Conversation.startSession({
      agentId: AGENT_ID,
      connectionType: 'websocket',
      overrides: {
        conversation: { textOnly: true },
        agent: { prompt: { llm: VISION_LLM } },
      },
      onMessage: async ({ message, source }: { message: string; source: string }) => {
        if (source !== 'ai') return;
        responses += 1;
        // Response one is the scripted greeting; the verdict follows.
        if (responses === 1) return;
        clearTimeout(timer);
        try {
          const match = message.match(/```json\s*([\s\S]*?)```/) ?? message.match(/(\{[\s\S]*\})/);
          const parsed = JSON.parse((match ? match[1] : message).trim());
          finish(() => resolve(parsed));
        } catch {
          finish(() => reject(new Error('The Somm mumbled something unreadable — try again.')));
        }
      },
      onError: () => {
        clearTimeout(timer);
        finish(() => reject(new Error('The line dropped mid-look. Give it another go.')));
      },
    })
      .then(async (c: any) => {
        conversation = c;
        try {
          const { fileId } = await c.uploadFile(imageBlob);
          c.sendMultimodalMessage({ text: INSTRUCTION, fileId });
        } catch {
          clearTimeout(timer);
          finish(() => reject(new Error('The photo would not reach the Somm — check your connection.')));
        }
      })
      .catch((e: any) => {
        clearTimeout(timer);
        finish(() => reject(e));
      });
  });
}
