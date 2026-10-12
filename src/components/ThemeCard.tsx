import { ArrowUpRight, Bookmark, Check, Columns2, Moon, Sun } from 'lucide-react';
import type { Messages } from '../i18n';
import type { Locale, Theme } from '../types';
import { Link } from './Link';
import { Workspace } from './Workspace';
export type CardProps = {
  locale: Locale;
  t: Messages;
  saved: string[];
  compared: string[];
  toggleSaved: (id: string) => void;
  toggleCompare: (id: string) => void;
};
export function ThemeCard({
  theme,
  locale,
  t,
  saved,
  compared,
  toggleSaved,
  toggleCompare,
}: CardProps & { theme: Theme }) {
  return (
    <article className="theme-card">
      <div className={`card-preview preview-stage ${theme.id}`}>
        <Link
          href={`/themes/${theme.id}`}
          className="preview-link"
          aria-label={`${t.view}: ${theme.name[locale]}`}
        >
          <span className="card-edition">WORKSPACE / 0{theme.order}</span>
          <Workspace theme={theme} t={t} compact />
          <span className="preview-open">
            <ArrowUpRight size={19} />
          </span>
        </Link>
        <button
          className={`save-button ${saved.includes(theme.id) ? 'selected' : ''}`}
          onClick={() => toggleSaved(theme.id)}
          aria-label={`${saved.includes(theme.id) ? t.unsave : t.save}: ${theme.name[locale]}`}
          aria-pressed={saved.includes(theme.id)}
        >
          <Bookmark size={17} fill={saved.includes(theme.id) ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="card-heading">
        <Link href={`/themes/${theme.id}`}>
          <h3>{theme.name[locale]}</h3>
        </Link>
        <div className="palette-dots" aria-hidden="true">
          {Object.values(theme.palette)
            .slice(0, 3)
            .concat(theme.palette.accent)
            .map((color) => (
              <i style={{ background: color }} key={color} />
            ))}
        </div>
      </div>
      <p>{theme.description[locale]}</p>
      <div className="card-bottom">
        <span className="theme-tags">
          {theme.mode === 'light' ? <Sun size={12} /> : <Moon size={12} />}
          {t[theme.mode]}
          <span>·</span>
          {t[theme.mood]}
        </span>
        <button
          className={compared.includes(theme.id) ? 'compare-button selected' : 'compare-button'}
          onClick={() => toggleCompare(theme.id)}
          aria-label={`${compared.includes(theme.id) ? t.removeCompare : t.addCompare}: ${theme.name[locale]}`}
          aria-pressed={compared.includes(theme.id)}
        >
          {compared.includes(theme.id) ? <Check size={13} /> : <Columns2 size={13} />}
          {t.compare}
        </button>
      </div>
      <span className="concept-label">{t.concept}</span>
    </article>
  );
}
