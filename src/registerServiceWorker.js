let deferredInstallPrompt = null;

export function registerServiceWorker() {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service Worker registered:', registration.scope);
      } catch (error) {
        console.warn('Service Worker registration failed:', error);
      }
    });
  }
}

export function initPwaPrompt() {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    window.careaiDeferredInstallPrompt = event;
  });
}

export function promptInstall() {
  const promptEvent = window.careaiDeferredInstallPrompt;
  if (!promptEvent) return;
  promptEvent.prompt();
  promptEvent.userChoice.then(() => { window.careaiDeferredInstallPrompt = null; });
}

export function requestNotificationPermission() {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        new Notification('CareAI is ready', { body: 'You will receive quick reminder alerts and offline access.', icon: '/icon.svg' });
      }
    });
  }
}
