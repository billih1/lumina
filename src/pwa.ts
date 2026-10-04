export function initPWA() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('[Lumina PWA] Active service worker registered:', registration.scope);
        })
        .catch((error) => {
          console.warn('[Lumina PWA] Service worker registration warning:', error);
        });
    });
  }
}
