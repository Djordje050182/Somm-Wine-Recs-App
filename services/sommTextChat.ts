// Text conversations with the Somm over the ElevenLabs agent websocket —
// the same brain, knowledge base and manners as the voice Somm, no
// microphone and no Claude proxy required. Used by Ask the Somm as the
// default path; the Claude proxy (when deployed) takes precedence upstream.

const AGENT_ID = 'agent_7301kwh2rqsjeapresnmn56tcrwd';
const WS_URL = `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${AGENT_ID}`;
const RESPONSE_TIMEOUT_MS = 45_000;

type Pending = { resolve: (text: string) => void; reject: (err: Error) => void; timer: number };

export class SommTextSession {
  private ws: WebSocket | null = null;
  private pending: Pending | null = null;
  private greeted = false;
  private opening: Promise<void> | null = null;

  // Which region's dynamic variables this session was opened with — callers
  // recreate the session when the guest switches region.
  constructor(
    private vars: Record<string, string> | null = null,
    public readonly regionId: string | null = null
  ) {}

  private open(): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return Promise.resolve();
    if (this.opening) return this.opening;

    this.opening = new Promise((resolve, reject) => {
      const ws = new WebSocket(WS_URL);
      this.ws = ws;
      this.greeted = false;

      const failOpen = setTimeout(() => reject(new Error('timeout')), 15_000);

      ws.onopen = () => {
        // Text only: no audio events, no microphone.
        ws.send(
          JSON.stringify({
            type: 'conversation_initiation_client_data',
            conversation_config_override: { conversation: { text_only: true } },
            ...(this.vars ? { dynamic_variables: this.vars } : {}),
          })
        );
      };

      ws.onmessage = event => {
        let msg: any;
        try {
          msg = JSON.parse(event.data);
        } catch {
          return;
        }
        switch (msg.type) {
          case 'conversation_initiation_metadata':
            clearTimeout(failOpen);
            resolve();
            break;
          case 'ping':
            ws.send(JSON.stringify({ type: 'pong', event_id: msg.ping_event?.event_id }));
            break;
          case 'agent_response': {
            const text: string = msg.agent_response_event?.agent_response ?? '';
            // The agent ALWAYS opens with its scripted greeting — whether or
            // not a question is already in flight. The UI has its own
            // greeting, so response number one is absorbed unconditionally.
            if (!this.greeted) {
              this.greeted = true;
              return;
            }
            if (!this.pending) return;
            const p = this.pending;
            this.pending = null;
            clearTimeout(p.timer);
            p.resolve(text.trim());
            break;
          }
          default:
            break;
        }
      };

      ws.onerror = () => {
        clearTimeout(failOpen);
        this.pending?.reject(new Error('connection error'));
        this.pending = null;
        reject(new Error('connection error'));
      };

      ws.onclose = () => {
        this.pending?.reject(new Error('closed'));
        this.pending = null;
        this.ws = null;
        this.opening = null;
      };
    });
    return this.opening;
  }

  async ask(text: string): Promise<string> {
    await this.open();
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) throw new Error('not connected');
    if (this.pending) throw new Error('one question at a time');

    return new Promise<string>((resolve, reject) => {
      const timer = window.setTimeout(() => {
        this.pending = null;
        reject(new Error('The Somm took too long over that one.'));
      }, RESPONSE_TIMEOUT_MS);
      this.pending = { resolve, reject, timer };
      this.ws!.send(JSON.stringify({ type: 'user_message', text }));
    });
  }

  end(): void {
    this.ws?.close();
    this.ws = null;
    this.opening = null;
  }
}
