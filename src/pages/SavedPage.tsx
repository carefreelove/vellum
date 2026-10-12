import { ThemeCard } from '../components/ThemeCard';
import { Empty, PageTitle } from '../components/ThemeUI';
import { useGallery } from '../hooks/useGallery';

export function SavedPage() {
  const { themes, t, saved, loadState, theme, cardProps } = useGallery();
  return (
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
  );
}
