import { Empty } from '../components/ThemeUI';
import { useGallery } from '../hooks/useGallery';

export function NotFoundPage() {
  const { t } = useGallery();
  return (
    <section className="container inner-page">
      <Empty title={t.notFound} body={t.notFoundBody} t={t} />
    </section>
  );
}
