import { ArrowRight } from 'lucide-react';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { messages, type Messages } from '../i18n';
import { localizedHref, parseComparison, routeInfo, setSearch } from '../lib/location';
import { isStringArray, readStored, writeStored } from '../lib/storage';
import type { Locale, Theme } from '../types';
import { useLocation } from './useLocation';

function useGalleryState() {
  const url = useLocation();
  const route = routeInfo(url.pathname);
  const locale: Locale =
    route.locale ||
    readStored(
      'vellum.locale',
      navigator.language.startsWith('zh') ? 'zh' : 'en',
      (v): v is Locale => v === 'zh' || v === 'en',
    );
  const path = route.path;
  const t: Messages = messages[locale];
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [saved, setSaved] = useState(() => readStored<string[]>('vellum.saved', [], isStringArray));
  const [storedCompare, setStoredCompare] = useState(() =>
    readStored<string[]>('vellum.compare', [], isStringArray).slice(0, 2),
  );
  const [toast, setToast] = useState('');
  const compared = url.searchParams.has('themes')
    ? parseComparison(url.searchParams.get('themes') || '')
    : storedCompare;
  const activeCompared = compared.filter((id) => themes.some((theme) => theme.id === id));
  let themeId = '';
  if (path.startsWith('/themes/')) {
    try {
      themeId = decodeURIComponent(path.slice(8));
    } catch {
      themeId = '__invalid__';
    }
  }
  const theme = themes.find((item) => item.id === themeId);

  useEffect(() => {
    writeStored('vellum.locale', locale);
    if (!route.locale) {
      window.history.replaceState(
        null,
        '',
        localizedHref(url.pathname + url.search + url.hash, locale),
      );
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
    const title =
      theme?.name[locale] ||
      {
        '/': `${t.title1} ${t.title2}`,
        '/guide': t.guide,
        '/saved': t.saved,
        '/compare': t.compare,
        '/about': t.about,
      }[path] ||
      t.notFound;
    document.title = `${title} — Vellum`;
  }, [locale, path, theme, route.locale, t]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    fetch('/api/themes', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('catalog');
        return response.json();
      })
      .then((data) => {
        setThemes(data.items);
        setLoading(false);
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setError(true);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [retry]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(timer);
  }, [toast]);
  function persist(key: string, value: unknown) {
    if (!writeStored(key, value)) setToast(t.storageError);
  }
  function toggleSaved(id: string) {
    const next = saved.includes(id) ? saved.filter((item) => item !== id) : [...saved, id];
    setSaved(next);
    persist('vellum.saved', next);
  }
  function updateCompare(ids: string[]) {
    const next = parseComparison(ids.join(','));
    setStoredCompare(next);
    persist('vellum.compare', next);
    // Keep an explicit empty query on comparison pages so clearing a shared URL
    // cannot fall back to somebody else's browser-local shortlist.
    if (path === '/compare') {
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set('themes', next.join(','));
      window.history.pushState(null, '', nextUrl);
      window.dispatchEvent(new PopStateEvent('popstate'));
    } else if (url.searchParams.has('themes')) setSearch({ themes: next.join(',') });
  }
  function toggleCompare(id: string) {
    if (activeCompared.includes(id)) updateCompare(activeCompared.filter((item) => item !== id));
    else if (activeCompared.length === 2) setToast(t.compareLimit);
    else updateCompare([...activeCompared, id]);
  }
  const cardProps = { locale, t, saved, compared: activeCompared, toggleSaved, toggleCompare };
  const loadState = loading ? (
    <div className="status" role="status">
      <span className="loader" />
      {t.loading}
    </div>
  ) : error ? (
    <div className="empty">
      <h2>{t.error}</h2>
      <p>{t.errorBody}</p>
      <button className="button" onClick={() => setRetry(retry + 1)}>
        {t.retry}
        <ArrowRight size={16} />
      </button>
    </div>
  ) : null;
  return {
    themes,
    locale,
    t,
    saved,
    compared: activeCompared,
    activeCompared,
    toggleSaved,
    toggleCompare,
    updateCompare,
    setToast,
    toast,
    loadState,
    theme,
    themeId,
    path,
    cardProps,
  };
}
const GalleryContext = createContext<ReturnType<typeof useGalleryState> | null>(null);
export function GalleryProvider({ children }: { children: ReactNode }) {
  const state = useGalleryState();
  return <GalleryContext.Provider value={state}>{children}</GalleryContext.Provider>;
}
export function useGallery() {
  const context = useContext(GalleryContext);
  if (!context) throw new Error('GalleryProvider is required');
  return context;
}
