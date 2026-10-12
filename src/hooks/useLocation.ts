import { useSyncExternalStore } from 'react';
const subscribe = (callback: () => void) => {
  window.addEventListener('popstate', callback);
  return () => window.removeEventListener('popstate', callback);
};
export function useLocation() {
  return new URL(useSyncExternalStore(subscribe, () => window.location.href));
}
