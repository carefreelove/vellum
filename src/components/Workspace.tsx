import { ArrowUp, Plus, PanelLeft, Folder, MessageSquare, Sparkles, Terminal } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { Theme } from '../types';
import type { Messages } from '../i18n';

export function Workspace({
  theme,
  t,
  compact = false,
}: {
  theme: Theme;
  t: Messages;
  compact?: boolean;
}) {
  const style = Object.fromEntries(
    Object.entries(theme.palette).map(([key, value]) => [`--preview-${key}`, value]),
  ) as CSSProperties;
  return (
    <div
      className={`workspace ${compact ? 'compact' : ''}`}
      style={style}
      role="img"
      aria-label={`${theme.name.en} — ${t.previewNote}`}
    >
      <div className="workspace-bar">
        <div className="traffic">
          <i />
          <i />
          <i />
        </div>
        <span>Codex</span>
        <PanelLeft size={12} />
      </div>
      <div className="workspace-body">
        <aside className="workspace-sidebar">
          <div className="workspace-new">
            <Plus size={11} />
            {t.previewNew}
          </div>
          <span className="workspace-label">{t.previewProjects}</span>
          <div>
            <Folder size={11} /> vellum-studio
          </div>
          <span className="workspace-label">{t.previewRecent}</span>
          <div>
            <MessageSquare size={10} />
            {t.previewItem}
          </div>
          <div>
            <MessageSquare size={10} />
            {t.previewItem2}
          </div>
          <span className="workspace-user">
            <b>V</b> {t.previewPersonal}
          </span>
        </aside>
        <div className="workspace-main">
          <span className="workspace-context">
            vellum-studio <span>⌘ K</span>
          </span>
          <div className="workspace-welcome">
            <span className="preview-flower">✳</span>
            <p>{t.previewProject}</p>
            <strong>{t.previewPrompt}</strong>
            <div className="workspace-suggestions">
              <span>
                <Sparkles size={11} />
                {t.previewTask}
              </span>
              <span>
                <Terminal size={11} />
                {t.previewTask2}
              </span>
            </div>
          </div>
          <div className="workspace-composer">
            <span>{t.previewInput}</span>
            <div>
              <Plus size={12} />
              <small>Codex · {t.previewLocal}</small>
              <b>
                <ArrowUp size={12} />
              </b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
