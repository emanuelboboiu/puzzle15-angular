import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideZoneChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { Device } from '@capacitor/device';

function normalizeLanguage(language: string | undefined): string {
  return (language || 'en').split(/[-_]/)[0].toLowerCase();
}

async function detectAndCacheLanguage(): Promise<void> {
  let lang = normalizeLanguage(
    navigator.language || navigator.languages?.[0],
  );
  const platform = (window as any).Capacitor?.getPlatform?.() || 'web';

  if (platform !== 'web') {
    try {
      const info = await Device.getLanguageCode();
      lang = normalizeLanguage(info.value);
    } catch {}
  }

  localStorage.setItem('detectedLang', lang);
}

async function initApp() {
  await detectAndCacheLanguage();

  await bootstrapApplication(AppComponent, {
    providers: [
      provideZoneChangeDetection(),
      provideHttpClient(withFetch()),
    ],
  });
}

initApp().catch((err) => console.error(err));
