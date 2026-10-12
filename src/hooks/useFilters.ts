import { setSearch } from '../lib/location';
import { useLocation } from './useLocation';

export function useFilters() {
  const { searchParams } = useLocation();
  const allowed = (key: string, values: string[], fallback: string) => {
    const value = searchParams.get(key) || fallback;
    return values.includes(value) ? value : fallback;
  };
  return {
    query: (searchParams.get('q') || '').slice(0, 100),
    mode: allowed('mode', ['all', 'light', 'dark'], 'all'),
    mood: allowed('mood', ['all', 'minimal', 'immersive', 'organic'], 'all'),
    sort: allowed('sort', ['curated', 'newest', 'name'], 'curated'),
    setQuery: (q: string) => setSearch({ q }, true),
    setMode: (mode: string) => setSearch({ mode: mode === 'all' ? '' : mode }),
    setMood: (mood: string) => setSearch({ mood: mood === 'all' ? '' : mood }),
    setSort: (sort: string) => setSearch({ sort: sort === 'curated' ? '' : sort }),
    reset: () => setSearch({ q: '', mode: '', mood: '', sort: '' }),
  };
}
