// Voice accent preference for Tara — each accent maps to its own ElevenLabs
// Conversational AI agent. Preference persists per-browser via localStorage,
// following this repo's `mindspace.*` key naming convention.

export type TaraAccent = 'auto' | 'us' | 'in' | 'ar' | 'au';

export const TARA_ACCENT_STORAGE_KEY = 'mindspace.employee.tara-accent';

export interface TaraAccentOption {
  id: TaraAccent;
  badge: string;
  label: string;
  description: string;
}

export const TARA_ACCENTS: TaraAccentOption[] = [
  { id: 'auto', badge: '', label: 'Auto (Recommended)', description: 'Uses the default Tara voice' },
  { id: 'us', badge: 'US', label: 'US English', description: 'American accent' },
  { id: 'in', badge: 'IN', label: 'Indian', description: 'South Asian accent' },
  { id: 'ar', badge: 'SA', label: 'Arabic', description: 'Arabic accent' },
  { id: 'au', badge: 'AU', label: 'Australian', description: 'Australian accent' },
];

function isTaraAccent(value: string | null): value is TaraAccent {
  return value === 'auto' || value === 'us' || value === 'in' || value === 'ar' || value === 'au';
}

/** Reads the user's saved accent choice, or null if none has been saved yet. */
export function getStoredTaraAccent(): TaraAccent | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(TARA_ACCENT_STORAGE_KEY);
  return isTaraAccent(raw) ? raw : null;
}

/** Persists the user's accent choice for future sessions. */
export function setStoredTaraAccent(accent: TaraAccent): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TARA_ACCENT_STORAGE_KEY, accent);
}

/** Resolves the ElevenLabs agent ID for an accent, falling back to the default agent. */
export function getAgentIdForAccent(accent: TaraAccent): string | undefined {
  const fallback = import.meta.env.VITE_ELEVENLABS_AGENT_ID as string | undefined;
  if (accent === 'auto') return fallback;
  const byAccent: Record<Exclude<TaraAccent, 'auto'>, string | undefined> = {
    us: import.meta.env.VITE_ELEVENLABS_AGENT_ID_US as string | undefined,
    in: import.meta.env.VITE_ELEVENLABS_AGENT_ID_IN as string | undefined,
    ar: import.meta.env.VITE_ELEVENLABS_AGENT_ID_AR as string | undefined,
    au: import.meta.env.VITE_ELEVENLABS_AGENT_ID_AU as string | undefined,
  };
  return byAccent[accent] || fallback;
}
