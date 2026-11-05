import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { api } from '../lib/api';
import type { SiteData } from '../lib/types';

type SiteState = {
  data: SiteData | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
};

const SiteContext = createContext<SiteState | null>(null);

export const FALLBACK_CONTENT: Record<string, string> = {
  studio_name: 'KAVÉ',
  tagline: 'Spaces that feel like you.',
};

export function SiteProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    api
      .get<SiteData>('/site', controller.signal)
      .then((payload) => {
        setData(payload);
        setError(null);
      })
      .catch((err: unknown) => {
        if ((err as Error)?.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Unable to load studio content');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  const value = useMemo(() => ({ data, loading, error, reload }), [data, loading, error, reload]);
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used inside SiteProvider');
  return ctx;
}

/** Read a content value with a sensible default. */
export function useCopy() {
  const { data } = useSite();
  return useMemo(() => {
    const content = { ...FALLBACK_CONTENT, ...(data?.content ?? {}) };
    return (key: string, fallback = '') => (content[key] ?? fallback) || fallback;
  }, [data]);
}
