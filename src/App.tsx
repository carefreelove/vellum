import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  Bookmark,
  Columns2,
  Search,
  X,
  Globe2,
  Github,
  Download,
  Check,
  Plus,
  Sun,
  Moon,
  SlidersHorizontal,
  MoveUpRight,
} from 'lucide-react';
import { messages, type Messages } from './i18n';
import type { Locale, Theme } from './types';
import { readStored, writeStored, isStringArray } from './lib/storage';
import { Workspace } from './components/Workspace';

const sourceUrl = 'https://github.com/carefreelove/vellum';
const initialLocale = (): Locale =>
  readStored(
    'vellum.locale',
    navigator.language.startsWith('zh') ? 'zh' : 'en',
    (v): v is Locale => v === 'zh' || v === 'en',
  );

export default function App() {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [saved, setSaved] = useState(() => readStored<string[]>('vellum.saved', [], isStringArray));
  const [compared, setCompared] = useState(() =>
    readStored<string[]>('vellum.compare', [], isStringArray).slice(0, 2),
  );
  const [toast, setToast] = useState('');
  const t: Messages = messages[locale];
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  useEffect(() => {
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
    document.title = `Vellum — ${locale === 'zh' ? '让工作空间，更像你一点。' : 'A space that feels like you.'}`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.intro);
  }, [locale, t.intro]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    fetch('/api/themes', { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('catalog');
        return res.json();
      })
      .then((data) => {
        setThemes(data.items);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
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
    setCompared(ids);
    persist('vellum.compare', ids);
  }
  function toggleCompare(id: string) {
    if (compared.includes(id)) updateCompare(compared.filter((item) => item !== id));
    else if (compared.length >= 2) setToast(t.compareLimit);
    else updateCompare([...compared, id]);
  }
  const activeCompared = compared.filter((id) => themes.some((theme) => theme.id === id));
  const cardProps = { locale, t, saved, compared, toggleSaved, toggleCompare };
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
  const themeId = path.startsWith('/themes/') ? decodeURIComponent(path.slice(8)) : '';
  const theme = themes.find((item) => item.id === themeId);
  return (
    <>
      <a className="skip-link" href="#main">
        {locale === 'zh' ? '跳至主要内容' : 'Skip to content'}
      </a>
      <header className="header">
        <a href="/" className="brand" aria-label="Vellum">
          <img src="/favicon.svg" alt="" />
          <span>
            vellum<span className="brand-dot">.</span>
          </span>
        </a>
        <nav aria-label={locale === 'zh' ? '主导航' : 'Main navigation'}>
          <a href="/#collection" className={path === '/' ? 'active' : ''}>
            {t.explore}
          </a>
          <a href="/guide" className={path === '/guide' ? 'active' : ''}>
            {t.guide}
          </a>
          <a href="/saved" className={path === '/saved' ? 'active' : ''}>
            {t.saved}
            {saved.length > 0 && <span className="nav-count">{saved.length}</span>}
          </a>
        </nav>
        <div className="header-actions">
          <button
            className="language"
            aria-label={locale === 'en' ? '切换为中文' : 'Switch to English'}
            onClick={() => {
              const next = locale === 'en' ? 'zh' : 'en';
              setLocale(next);
              persist('vellum.locale', next);
            }}
          >
            <Globe2 size={15} />
            <span>{locale === 'en' ? '中文' : 'EN'}</span>
          </button>
          <a
            className="icon-button github-link"
            href={sourceUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={t.source}
          >
            <Github size={19} />
          </a>
        </div>
      </header>
      <main id="main">
        {path === '/' && (
          <>
            <section className="hero container">
              <div className="hero-copy">
                <p className="eyebrow">
                  <span className="tiny-star">✳</span>
                  {t.eyebrow}
                </p>
                <h1>
                  {t.title1}
                  <br />
                  <span>{t.title2}</span>
                </h1>
                <p className="hero-intro">{t.intro}</p>
                <div className="hero-actions">
                  <a href="#collection" className="button">
                    {t.browse}
                    <ArrowUpRight size={17} />
                  </a>
                  <a className="text-link" href="/guide">
                    {t.how}
                    <ArrowRight size={15} />
                  </a>
                </div>
                <div className="hero-edition">
                  <span className="edition-line" />
                  {t.edition}
                </div>
              </div>
              <div className="hero-art">
                <div className="hero-art-top">
                  <span>{t.featured}</span>
                  <span>01 / 03</span>
                </div>
                <div className="art-orbit" aria-hidden="true" />
                <div className="art-star" aria-hidden="true">
                  ✳
                </div>
                {themes[0] ? (
                  <a
                    className="hero-workspace"
                    href={`/themes/${themes[0].id}`}
                    aria-label={`${t.view}: ${themes[0].name[locale]}`}
                  >
                    <Workspace theme={themes[0]} t={t} />
                  </a>
                ) : (
                  <div className="hero-placeholder" aria-hidden="true">
                    V
                  </div>
                )}
                <div className="hero-art-bottom">
                  <div>
                    <span className="eyebrow">{t.featuredNote}</span>
                    <a href="/themes/paper-studio">
                      Paper Studio <ArrowUpRight size={19} />
                    </a>
                  </div>
                  <span className="round-seal" aria-hidden="true">
                    V<br />
                    <small>STUDIO</small>
                  </span>
                </div>
              </div>
            </section>
            <div className="ticker">
              <span>CODEX, WITH CHARACTER</span>
              <span>✳</span>
              <span>
                {locale === 'zh' ? '让日常工作，也有自己的美学' : 'A LITTLE MORE YOU. EVERY DAY.'}
              </span>
              <span>✳</span>
              <span>THOUGHTFULLY CURATED</span>
              <span>✳</span>
              <span>CODEX, WITH CHARACTER</span>
            </div>
            <section id="collection" className="container collection">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">01 — {t.explore}</p>
                  <h2>{t.collectionTitle}</h2>
                  <p>{t.collectionIntro}</p>
                </div>
                <span className="section-number">(003)</span>
              </div>
              {loadState || <Catalog themes={themes} {...cardProps} />}
            </section>
            <section className="manifesto container">
              <div>
                <p className="eyebrow">{t.manifestoLabel}</p>
                <h2>
                  {t.manifestoTitle.split('\n').map((line, index) => (
                    <span key={line}>
                      {line}
                      {index === 0 && <br />}
                    </span>
                  ))}
                </h2>
                <p>{t.manifestoBody}</p>
                <a href="/about" className="text-link">
                  {t.about}
                  <ArrowUpRight size={17} />
                </a>
              </div>
              <div className="principles">
                {[1, 2, 3].map((number) => (
                  <div className="principle" key={number}>
                    <span>0{number}</span>
                    <div>
                      <h3>{t[`feature${number}` as keyof Messages]}</h3>
                      <p>{t[`feature${number}Body` as keyof Messages]}</p>
                    </div>
                    <ArrowUpRight size={20} />
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
        {path === '/saved' && (
          <section className="container inner-page">
            <PageTitle eyebrow={t.saved} title={t.savedTitle} intro={t.savedIntro} />
            {loadState ||
              (themes.some((item) => saved.includes(item.id)) ? (
                <div className="theme-grid">
                  {themes
                    .filter((item) => saved.includes(item.id))
                    .map((item) => (
                      <ThemeCard key={item.id} theme={item} {...cardProps} />
                    ))}
                </div>
              ) : (
                <Empty title={t.emptySaved} body={t.emptySavedBody} t={t} />
              ))}
          </section>
        )}
        {path === '/compare' && (
          <section className="container inner-page">
            <PageTitle eyebrow={t.compare} title={t.compareTitle} intro={t.compareIntro} />
            {loadState || (
              <div className="compare-grid">
                {[0, 1].map((index) => {
                  const selected = themes.find((item) => item.id === activeCompared[index]);
                  return (
                    <div className="compare-panel" key={index}>
                      <label htmlFor={`compare-${index}`} className="eyebrow">
                        0{index + 1} — {t.selectTheme}
                      </label>
                      <select
                        id={`compare-${index}`}
                        value={selected?.id || ''}
                        onChange={(event) => {
                          const next = [...activeCompared];
                          if (event.target.value) next[index] = event.target.value;
                          else next.splice(index, 1);
                          updateCompare(next.filter(Boolean));
                        }}
                      >
                        <option value="">{t.selectTheme}</option>
                        {themes
                          .filter(
                            (item) => item.id === selected?.id || !activeCompared.includes(item.id),
                          )
                          .map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name[locale]}
                            </option>
                          ))}
                      </select>
                      {selected ? (
                        <>
                          <div className={`preview-stage ${selected.id}`}>
                            <Workspace theme={selected} t={t} />
                          </div>
                          <h2>{selected.name[locale]}</h2>
                          <p>{selected.description[locale]}</p>
                          <Palette theme={selected} t={t} notify={setToast} />
                          <a className="text-link" href={`/themes/${selected.id}`}>
                            {t.view}
                            <ArrowUpRight size={16} />
                          </a>
                        </>
                      ) : (
                        <div className="compare-empty">
                          <Columns2 size={32} />
                          <p>{t.emptyCompare}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
        {themeId && (
          <section className="container inner-page">
            {loadState ||
              (theme ? (
                <>
                  <a href="/#collection" className="back-link">
                    <ArrowLeft size={16} />
                    {t.back}
                  </a>
                  <div className="detail-heading">
                    <div>
                      <p className="eyebrow">
                        {t.studio} / {t.concept}
                      </p>
                      <h1>{theme.name[locale]}</h1>
                      <p>{theme.description[locale]}</p>
                    </div>
                    <div className="detail-actions">
                      <button
                        className="outline-button"
                        aria-pressed={saved.includes(theme.id)}
                        onClick={() => toggleSaved(theme.id)}
                      >
                        <Bookmark
                          size={17}
                          fill={saved.includes(theme.id) ? 'currentColor' : 'none'}
                        />
                        {saved.includes(theme.id) ? t.unsave : t.save}
                      </button>
                      <button
                        className="outline-button"
                        aria-pressed={compared.includes(theme.id)}
                        onClick={() => toggleCompare(theme.id)}
                      >
                        <Columns2 size={17} />
                        {compared.includes(theme.id) ? t.removeCompare : t.addCompare}
                      </button>
                    </div>
                  </div>
                  <div className={`detail-preview preview-stage ${theme.id}`}>
                    <div className="preview-caption">
                      <span>
                        {t.previewLabel} / 0{theme.order}
                      </span>
                      <span>
                        {theme.mode === 'light' ? <Sun size={15} /> : <Moon size={15} />}
                        {t[theme.mode]}
                      </span>
                    </div>
                    <Workspace theme={theme} t={t} />
                    <p className="preview-disclaimer">{t.previewNote}</p>
                  </div>
                  <div className="detail-columns">
                    <div>
                      <p className="eyebrow">{t.story}</p>
                      <h2>{theme.name[locale]}</h2>
                      <p className="story-text">{theme.story[locale]}</p>
                      <h3>{t.palette}</h3>
                      <Palette theme={theme} t={t} notify={setToast} />
                      <div className="concept-notice">
                        <span>✳</span>
                        <div>
                          <h3>{t.conceptTitle}</h3>
                          <p>{t.conceptBody}</p>
                        </div>
                      </div>
                    </div>
                    <aside className="metadata">
                      <p className="eyebrow">{t.details}</p>
                      {[
                        [t.author, t.studio],
                        [t.mode, t[theme.mode]],
                        [t.version, theme.version],
                        [t.license, theme.license],
                        [t.updated, theme.updatedAt],
                      ].map(([label, value]) => (
                        <div className="metadata-row" key={label}>
                          <span>{label}</span>
                          <strong>{value}</strong>
                        </div>
                      ))}
                      <a className="button" href={`/api/themes/${theme.id}/palette`} download>
                        {t.download}
                        <Download size={16} />
                      </a>
                      <p className="download-note">{t.downloadNote}</p>
                    </aside>
                  </div>
                </>
              ) : (
                <Empty title={t.notFound} body={t.notFoundBody} t={t} />
              ))}
          </section>
        )}
        {path === '/guide' && (
          <section className="container inner-page reading-page">
            <PageTitle eyebrow={t.guide} title={t.guideTitle} intro={t.guideIntro} />
            <div className="guide-steps">
              {[1, 2, 3, 4].map((number) => (
                <article key={number}>
                  <span className="step-number">0{number}</span>
                  <div>
                    <h2>{t[`step${number}` as keyof Messages]}</h2>
                    <p>{t[`step${number}Body` as keyof Messages]}</p>
                  </div>
                </article>
              ))}
            </div>
            <h2 className="faq-heading">{t.faq}</h2>
            <div className="faqs">
              {[1, 2, 3, 4].map((number) => (
                <details key={number}>
                  <summary>
                    {t[`faq${number}` as keyof Messages]}
                    <Plus size={18} />
                  </summary>
                  <p>{t[`faq${number}Body` as keyof Messages]}</p>
                </details>
              ))}
            </div>
            <a href="/#collection" className="button">
              {t.browse}
              <ArrowUpRight size={17} />
            </a>
          </section>
        )}
        {path === '/about' && (
          <section className="container inner-page reading-page">
            <PageTitle eyebrow={t.about} title={t.aboutTitle} intro={t.aboutIntro} />
            <div className="about-mark" aria-hidden="true">
              v<span>✳</span>
            </div>
            <p className="about-body">{t.aboutBody}</p>
            <h2>{t.aboutScope}</h2>
            <p className="about-body">{t.aboutScopeBody}</p>
            <h2>{t.privacy}</h2>
            <p className="about-body">{t.privacyBody}</p>
            <a href={sourceUrl} className="button" target="_blank" rel="noreferrer">
              {t.source}
              <Github size={17} />
            </a>
          </section>
        )}
        {!['/', '/saved', '/compare', '/guide', '/about'].includes(path) && !themeId && (
          <section className="container inner-page">
            <Empty title={t.notFound} body={t.notFoundBody} t={t} />
          </section>
        )}
      </main>
      <footer className="footer container">
        <div className="footer-top">
          <div>
            <a href="/" className="brand footer-brand">
              vellum<span className="brand-dot">.</span>
            </a>
            <p>{t.footer}</p>
          </div>
          <div className="footer-links">
            <a href="/guide">{t.guide}</a>
            <a href="/about">{t.about}</a>
            <a href={sourceUrl} target="_blank" rel="noreferrer">
              GitHub
              <ArrowUpRight size={14} />
            </a>
          </div>
          <a className="back-top" href="#main" aria-label={t.top}>
            <MoveUpRight size={23} />
          </a>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Vellum. {t.copyright}</span>
          <span>{t.independent}</span>
        </div>
      </footer>
      {activeCompared.length > 0 && path !== '/compare' && (
        <aside className="compare-tray" aria-label={t.compare}>
          <Columns2 size={19} />
          <span>
            {activeCompared.length}/2 <span className="tray-label">{t.compare}</span>
          </span>
          <div className="tray-swatches">
            {activeCompared.map((id) => (
              <i
                key={id}
                style={{ background: themes.find((theme) => theme.id === id)?.palette.background }}
              />
            ))}
          </div>
          <a href="/compare">
            {t.compareAction}
            <ArrowRight size={16} />
          </a>
          <button onClick={() => updateCompare([])} className="icon-button" aria-label={t.clear}>
            <X size={16} />
          </button>
        </aside>
      )}
      {toast && (
        <div role="status" className="toast">
          <Check size={17} />
          {toast}
        </div>
      )}
    </>
  );
}

type CardProps = {
  locale: Locale;
  t: Messages;
  saved: string[];
  compared: string[];
  toggleSaved: (id: string) => void;
  toggleCompare: (id: string) => void;
};
function ThemeCard({
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
        <a
          href={`/themes/${theme.id}`}
          className="preview-link"
          aria-label={`${t.view}: ${theme.name[locale]}`}
        >
          <span className="card-edition">WORKSPACE / 0{theme.order}</span>
          <Workspace theme={theme} t={t} compact />
          <span className="preview-open">
            <ArrowUpRight size={19} />
          </span>
        </a>
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
        <a href={`/themes/${theme.id}`}>
          <h3>{theme.name[locale]}</h3>
        </a>
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
function Catalog({ themes, ...props }: CardProps & { themes: Theme[] }) {
  const { t } = props;
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('all');
  const [mood, setMood] = useState('all');
  const [sort, setSort] = useState('curated');
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
          <button
            className="outline-button"
            onClick={() => {
              setQuery('');
              setMode('all');
              setMood('all');
            }}
          >
            {t.reset}
          </button>
        </div>
      )}
    </>
  );
}
function PageTitle({ eyebrow, title, intro }: { eyebrow: string; title: string; intro: string }) {
  return (
    <div className="page-title">
      <p className="eyebrow">VELLUM / {eyebrow}</p>
      <h1>{title}</h1>
      <p>{intro}</p>
    </div>
  );
}
function Empty({ title, body, t }: { title: string; body: string; t: Messages }) {
  return (
    <div className="empty">
      <span className="empty-star">✳</span>
      <h2>{title}</h2>
      <p>{body}</p>
      <a href="/#collection" className="button">
        {t.browse}
        <ArrowUpRight size={16} />
      </a>
    </div>
  );
}
function Palette({
  theme,
  t,
  notify,
}: {
  theme: Theme;
  t: Messages;
  notify: (text: string) => void;
}) {
  return (
    <div className="palette">
      {Object.entries(theme.palette).map(([key, color]) => (
        <button
          className="palette-color"
          key={key}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(color);
              notify(`${t.copied} · ${color}`);
            } catch {
              notify(t.copyFailed);
            }
          }}
          aria-label={`${t[key as keyof Messages]} ${color}`}
        >
          <span style={{ background: color }} />
          <strong>{t[key as keyof Messages]}</strong>
          <code>{color}</code>
        </button>
      ))}
    </div>
  );
}
