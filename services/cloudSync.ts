// Cloud sync — the Supabase seam, ready to light up.
//
// The app is offline-first: every feature reads and writes localStorage and
// works with no account at all. When VITE_SUPABASE_URL and
// VITE_SUPABASE_ANON_KEY are present AND a user is signed in through
// Supabase auth, this module mirrors the known state keys to the
// user_state table (see supabase/schema.sql): pull on sign-in, debounced
// push on change. No feature code changes; the seam is this file.
//
// Until the keys exist, isCloudSyncEnabled() is false and everything below
// is inert — which is exactly the friends-testing configuration.

const SYNCED_KEYS = [
  'sommTastings',
  'sommFavWines',
  'sommFavWineries',
  'sommRegion',
  'sommPartnerListings',
  'sommPartnerWines',
] as const;

const URL_KEY = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isCloudSyncEnabled = (): boolean => Boolean(URL_KEY && ANON_KEY);

type SupabaseLike = {
  from: (table: string) => any;
  auth: { getUser: () => Promise<{ data: { user: { id: string } | null } }> };
};

let client: SupabaseLike | null = null;

// The @supabase/supabase-js dependency is added only when the seam goes
// live, so today's bundle carries none of it. This dynamic import keeps the
// call sites ready.
const getClient = async (): Promise<SupabaseLike | null> => {
  if (!isCloudSyncEnabled()) return null;
  if (client) return client;
  try {
    // @ts-expect-error — dependency arrives with the production phase
    const { createClient } = await import('@supabase/supabase-js');
    client = createClient(URL_KEY!, ANON_KEY!);
    return client;
  } catch {
    return null;
  }
};

export const pullState = async (): Promise<number> => {
  const sb = await getClient();
  if (!sb) return 0;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return 0;
  const { data } = await sb.from('user_state').select('key,value').eq('user_id', user.id);
  let applied = 0;
  for (const row of data ?? []) {
    if ((SYNCED_KEYS as readonly string[]).includes(row.key)) {
      localStorage.setItem(row.key, JSON.stringify(row.value));
      applied++;
    }
  }
  return applied;
};

let pushTimer: number | undefined;

export const schedulePush = () => {
  if (!isCloudSyncEnabled()) return;
  window.clearTimeout(pushTimer);
  pushTimer = window.setTimeout(() => { void pushState(); }, 4000);
};

export const pushState = async (): Promise<number> => {
  const sb = await getClient();
  if (!sb) return 0;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return 0;
  let pushed = 0;
  for (const key of SYNCED_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw === null) continue;
    try {
      await sb.from('user_state').upsert({
        user_id: user.id,
        key,
        value: JSON.parse(raw),
        updated_at: new Date().toISOString(),
      });
      pushed++;
    } catch {
      // transient network failure — the next scheduled push retries
    }
  }
  return pushed;
};
