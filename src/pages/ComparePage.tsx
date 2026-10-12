import { ArrowUpRight, Columns2 } from 'lucide-react';
import { Link } from '../components/Link';
import { ShareButton } from '../components/ShareButton';
import { PageTitle, Palette } from '../components/ThemeUI';
import { Workspace } from '../components/Workspace';
import { useGallery } from '../hooks/useGallery';

export function ComparePage() {
  const { themes, locale, t, activeCompared, updateCompare, setToast, loadState, theme } =
    useGallery();
  return (
    <section className="container inner-page">
      <ShareButton />
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
                    .filter((item) => item.id === selected?.id || !activeCompared.includes(item.id))
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
                    <Link className="text-link" href={`/themes/${selected.id}`}>
                      {t.view}
                      <ArrowUpRight size={16} />
                    </Link>
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
  );
}
