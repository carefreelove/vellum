import { ArrowLeft, Bookmark, Columns2, Download, Moon, Sun } from 'lucide-react';
import { Link } from '../components/Link';
import { NativeShare } from '../components/NativeShare';
import { ShareButton } from '../components/ShareButton';
import { Empty, Palette } from '../components/ThemeUI';
import { Workspace } from '../components/Workspace';
import { useGallery } from '../hooks/useGallery';

export function ThemePage() {
  const {
    themes,
    locale,
    t,
    saved,
    compared,
    toggleSaved,
    toggleCompare,
    setToast,
    loadState,
    theme,
  } = useGallery();
  return (
    <section className="container inner-page">
      <ShareButton />
      {loadState ||
        (theme ? (
          <>
            <Link href="/#collection" className="back-link">
              <ArrowLeft size={16} />
              {t.back}
            </Link>
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
                  <Bookmark size={17} fill={saved.includes(theme.id) ? 'currentColor' : 'none'} />
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
                <NativeShare />
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
                <Link className="button" href={`/api/themes/${theme.id}/palette`} download>
                  {t.download}
                  <Download size={16} />
                </Link>
                <p className="download-note">{t.downloadNote}</p>
              </aside>
            </div>
          </>
        ) : (
          <Empty title={t.notFound} body={t.notFoundBody} t={t} />
        ))}
    </section>
  );
}
