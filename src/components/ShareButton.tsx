import { Share2 } from 'lucide-react';
import { useGallery } from '../hooks/useGallery';

export function ShareButton() {
  const { t, setToast, path, activeCompared } = useGallery();
  return (
    <button
      className="outline-button share-button"
      onClick={async () => {
        const url = new URL(window.location.href);
        if (path === '/compare') url.searchParams.set('themes', activeCompared.join(','));
        try {
          await navigator.clipboard.writeText(url.href);
          setToast(t.shareCopied);
        } catch {
          setToast(t.shareFailed);
        }
      }}
    >
      <Share2 size={15} />
      {t.share}
    </button>
  );
}
