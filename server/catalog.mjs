// Platform-neutral catalog rules shared by Node and the hosted D1 adapter.
export function queryCatalog(themes, params) {
  const values = {};
  for (const [key, fallback] of Object.entries({
    q: '',
    mode: 'all',
    mood: 'all',
    sort: 'curated',
  })) {
    if (params.getAll(key).length > 1) return null;
    values[key] = params.get(key) ?? fallback;
  }
  const { q, mode, mood, sort } = values;
  if (
    q.length > 100 ||
    !['all', 'light', 'dark'].includes(mode) ||
    !['all', 'minimal', 'immersive', 'organic'].includes(mood) ||
    !['curated', 'newest', 'name'].includes(sort)
  )
    return null;
  const keyword = q.trim().toLowerCase();
  const items = themes.filter(
    (t) =>
      (mode === 'all' || t.mode === mode) &&
      (mood === 'all' || t.mood === mood) &&
      (!keyword || JSON.stringify([t.name, t.description, t.tags]).toLowerCase().includes(keyword)),
  );
  items.sort((a, b) =>
    sort === 'newest'
      ? b.updatedAt.localeCompare(a.updatedAt)
      : sort === 'name'
        ? a.name.en.localeCompare(b.name.en)
        : a.order - b.order,
  );
  return { items, total: items.length };
}
export function paletteDocument(theme) {
  return {
    schema: 'gallery-palette-v1',
    id: theme.id,
    name: theme.name,
    version: theme.version,
    license: theme.license,
    status: theme.status,
    notice: 'Design tokens only. Not an installable Codex theme package.',
    palette: theme.palette,
  };
}
export function nativeShare(theme) {
  if (theme?.id !== 'paper-studio') return null;
  return (
    'codex-theme-v1:' +
    JSON.stringify({
      codeThemeId: 'codex',
      theme: {
        accent: theme.palette.accent,
        accentSource: 'custom',
        contrast: 45,
        fonts: { code: null, ui: null },
        ink: theme.palette.foreground,
        opaqueWindows: true,
        semanticColors: { diffAdded: '#00a240', diffRemoved: '#ba2623', skill: '#924ff7' },
        surface: theme.palette.background,
      },
      variant: 'light',
    })
  );
}
