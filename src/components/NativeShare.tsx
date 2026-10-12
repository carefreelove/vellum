import { Copy, Download } from 'lucide-react';
import { useGallery } from '../hooks/useGallery';
export function NativeShare() {
  const { theme, t, setToast } = useGallery();
  if (theme?.id !== 'paper-studio') return null;
  return (
    <section className="native-share">
      <p className="eyebrow">{t.nativeStatus}</p>
      <h3>{t.nativeShare}</h3>
      <p>{t.nativeHelp}</p>
      <div className="native-actions">
        <button
          className="button"
          onClick={async () => {
            try {
              const response = await fetch('/api/themes/paper-studio/native');
              if (!response.ok) throw new Error('Native theme unavailable');
              await navigator.clipboard.writeText(await response.text());
              setToast(t.nativeCopied);
            } catch {
              setToast(t.nativeFailed);
            }
          }}
        >
          <Copy size={16} />
          {t.nativeShare}
        </button>
        <a className="outline-button" href="/api/themes/paper-studio/native" download>
          <Download size={16} />
          {t.nativeDownload}
        </a>
      </div>
    </section>
  );
}
