import { HttpClientModule } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { Device } from '@capacitor/device';

async function detectAndCacheLanguage(): Promise<void> {
  let lang = 'en';
  const platform = (window as any).Capacitor?.getPlatform?.() || 'web';

  if (platform === 'web') {
    lang = (navigator.language || navigator.languages[0] || 'en').substring(
      0,
      2
    );
  } else {
    try {
      const info = await Device.getLanguageCode();
      lang = info.value?.substring(0, 2) || 'en';
    } catch {
      lang = 'en';
    }
  }

  localStorage.setItem('detectedLang', lang);
  document.documentElement.lang = lang;
}

async function initApp() {
  await detectAndCacheLanguage();

  await bootstrapApplication(AppComponent, {
    providers: [importProvidersFrom(HttpClientModule)],
  });
}

initApp().catch((err) => console.error(err));
