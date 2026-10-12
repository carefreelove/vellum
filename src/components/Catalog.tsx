import { Moon, Search, SlidersHorizontal, Sun, X } from 'lucide-react';
import { useFilters } from '../hooks/useFilters';
import type { Theme } from '../types';
import { ShareButton } from './ShareButton';
import { ThemeCard, type CardProps } from './ThemeCard';
export function Catalog({ themes, ...props }: CardProps & { themes: Theme[] }) {
  const { t } = props;
  const { query, mode, mood, sort, setQuery, setMode, setMood, setSort, reset } = useFilters();
  const items = themes
    .filter(
      (theme) =>
        (mode === 'all' || theme.mode === mode) &&
        (mood === 'all' || theme.mood === mood) &&
        JSON.stringify([theme.name, theme.description, theme.tags])
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
    )
    .sort((a, b) =>
      sort === 'newest'
        ? b.updatedAt.localeCompare(a.updatedAt)
        : sort === 'name'
          ? a.name.en.localeCompare(b.name.en)
          : a.order - b.order,
    );
  return (
    <>
      <div className="filter-bar">
        <div className="mode-tabs" role="group" aria-label={t.mode}>
          {(['all', 'light', 'dark'] as const).map((value) => (
            <button
              key={value}
              aria-pressed={mode === value}
              className={mode === value ? 'selected' : ''}
              onClick={() => setMode(value)}
            >
              {value === 'light' ? <Sun size={14} /> : value === 'dark' ? <Moon size={14} /> : null}
              {t[value]}
            </button>
          ))}
        </div>
        <div className="filter-controls">
          <div className="search-field">
            <Search size={15} />
            <input
              maxLength={100}
              aria-label={t.searchLabel}
              placeholder={t.search}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button aria-label={t.clear} onClick={() => setQuery('')}>
                <X size={14} />
              </button>
            )}
          </div>
          <div className="mood-select">
            <SlidersHorizontal size={14} />
            <select value={mood} onChange={(e) => setMood(e.target.value)} aria-label={t.moodLabel}>
              <option value="all">{t.allMoods}</option>
              {(['minimal', 'immersive', 'organic'] as const).map((value) => (
                <option key={value} value={value}>
                  {t[value]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="results-bar">
        <ShareButton />
        <span aria-live="polite">
          {String(items.length).padStart(2, '0')} {t.result}
        </span>
        <select aria-label={t.sortLabel} value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="curated">{t.curated}</option>
          <option value="newest">{t.newest}</option>
          <option value="name">{t.name}</option>
        </select>
      </div>
      {items.length ? (
        <div className="theme-grid">
          {items.map((theme) => (
            <ThemeCard key={theme.id} theme={theme} {...props} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <Search size={28} />
          <h3>{t.noResults}</h3>
          <p>{t.noResultsBody}</p>
          <button className="outline-button" onClick={reset}>
            {t.reset}
          </button>
        </div>
      )}
    </>
  );
}
