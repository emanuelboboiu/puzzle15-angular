import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  isDev = false; // not to have many stats when developing.
  os: number = 0; // 0 means web, 1 means iOS, 2 means Android.
  currVersion = '3.0';
  deviceNames = ['Web', 'iOS', 'Android'];
  detectedLang: string = 'en'; // this will be set in main.ts before app is bootstrapped.
  language: string = 'en'; // this is only to have something declared, never used this value.
  acceptedLanguages: string[] = [
    'de',
    'en',
    'el',
    'es',
    'fr',
    'hu',
    'it',
    'ja',
    'ko',
    'pl',
    'pt',
    'ro',
    'ru',
    'tr',
    'vi',
    'zh',
  ]; // Array of accepted languages
  languageData: any;
  preferredLangKey: string = 'preferredLang';
  hasChosenLanguageKey: string = 'hasChosenLanguage';
  isSound: boolean = true;
  lsIsSoundKey: string = 'lsSettingsSound';
  soundScheme: string = 'wooden'; // Default sound scheme
  lsSoundSchemeKey: string = 'lsSettingsSoundScheme';
  acceptedSoundSchemes: string[] = ['wooden', 'metal']; // Array of accepted sound schemes
  soundVolume: number = 0.7; // Default volume (0.0 to 1.0)
  lsSoundVolumeKey: string = 'lsSettingsSoundVolume';
  isAccessibility: boolean = false;
  lsIsAccessibilityKey: string = 'lsSettingsAccessibility';
  hasAnsweredLabellingPromptKey: string = 'hasAnsweredLabellingPrompt';
  isGestures: boolean = true;
  lsIsGesturesKey: string = 'lsSettingsGestures';
  // For autosaving a not abandoned game:
  isSavedGameKey: string = 'isSavedGame';
  savedBoardSizeKey: string = 'savedBoardSize';
  savedMovesKey: string = 'savedMoves'; // for the number of moves.
  savedSecondsKey: string = 'savedSeconds'; // for duration in seconds.
  savedBoardNumbersKey: string = 'savedBoardNumbers'; // for the array of number stringiffied.

  constructor(private http: HttpClient) {
    this.loadSettingsFromLocalStorage();
  } // end constructor.

  // A method to load the settings from local storage:
  loadSettingsFromLocalStorage(): void {
    this.detectChosenLanguage();
    if (this.lsExists(this.lsIsSoundKey)) {
      this.isSound = this.getBooleanSetting(this.lsIsSoundKey);
    } else {
      this.isSound = true;
    }
    if (this.lsExists(this.lsSoundSchemeKey)) {
      const savedScheme = this.getStringSetting(this.lsSoundSchemeKey);
      if (this.acceptedSoundSchemes.includes(savedScheme)) {
        this.soundScheme = savedScheme;
      } else {
        this.soundScheme = 'wooden';
      }
    } else {
      this.soundScheme = 'wooden';
    }
    if (this.lsExists(this.lsSoundVolumeKey)) {
      const savedVolume = this.getNumberSetting(this.lsSoundVolumeKey);
      if (savedVolume >= 0 && savedVolume <= 1) {
        this.soundVolume = savedVolume;
      } else {
        this.soundVolume = 0.7;
      }
    } else {
      this.soundVolume = 0.7;
    }
    if (this.lsExists(this.lsIsAccessibilityKey)) {
      this.isAccessibility = this.getBooleanSetting(this.lsIsAccessibilityKey);
    } else {
      this.isAccessibility = false;
    }
    if (this.lsExists(this.lsIsGesturesKey)) {
      this.isGestures = this.getBooleanSetting(this.lsIsGesturesKey);
    } else {
      this.isGestures = this.isMobile();
    }

    // Load language data from xx.json files found in assets/i18n:
    this.languageData = null;
    this.loadLanguageWithFallback(this.language).subscribe((data) => {
      this.languageData = data;
    });
    //end load language file.
  } // end of loadSettingsFromLocalStorage() method.

  // A method to check wether a key exists in the localStorage or not:
  lsExists(key: string): boolean {
    return localStorage.getItem(key) == null ? false : true;
  } // end lsExists() method.

  saveBooleanSetting(key: string, value: boolean): void {
    localStorage.setItem(key, this.convertBooleanToString(value));
  } // end saveBooleanSetting() method.

  getBooleanSetting(key: string): boolean {
    return this.convertStringToBoolean(String(localStorage.getItem(key)));
  } // end getBooleanSetting() method.

  saveStringSetting(key: string, value: string): void {
    localStorage.setItem(key, value);
  } // end saveBooleanSetting() method.

  getStringSetting(key: string): string {
    return String(localStorage.getItem(key));
  } // end getBooleanSetting() method.

  saveNumberSetting(key: string, value: number): void {
    localStorage.setItem(key, String(value));
  } // end saveNumberSetting() method.

  getNumberSetting(key: string): number {
    const item = localStorage.getItem(key);
    if (item !== null) {
      return Number(item);
    } else {
      return 0;
    }
  } // end getNumberSetting() method.

  // Some methods to convert values and save and get them from localStorage:
  convertBooleanToString(value: boolean): string {
    return value == true ? '1' : '0';
  } // end convertBooleanToString() method.

  convertStringToBoolean(value: string): boolean {
    return value == '1' ? true : false;
  } // end convertStringToBoolean() method.

  // Methods for translation:
  loadLanguage(lang: string): Observable<any> {
    return this.http.get<any>(`/assets/i18n/${lang}.json`);
  } // end loadLanguage() method.

  private loadLanguageWithFallback(lang: string): Observable<any> {
    return this.loadLanguage(lang).pipe(
      catchError(() => {
        this.applyLanguage('en');
        return this.loadLanguage('en');
      }),
    );
  }

  // A method to charge the chosen language:
  detectChosenLanguage(): void {
    this.detectedLang = this.normalizeLanguage(
      localStorage.getItem('detectedLang'),
    );

    const savedLanguage = this.normalizeLanguage(
      localStorage.getItem(this.preferredLangKey),
    );
    const hasExplicitChoice =
      localStorage.getItem(this.hasChosenLanguageKey) === '1';

    if (hasExplicitChoice && this.isSupportedLanguage(savedLanguage)) {
      this.applyLanguage(savedLanguage);
      return;
    }

    // Migration from versions that did not distinguish an automatically
    // detected language from one selected explicitly by the user.
    if (
      !hasExplicitChoice &&
      savedLanguage !== 'en' &&
      this.isSupportedLanguage(savedLanguage)
    ) {
      localStorage.setItem(this.hasChosenLanguageKey, '1');
      this.applyLanguage(savedLanguage);
      return;
    }

    localStorage.removeItem(this.preferredLangKey);
    this.applyLanguage(
      this.isSupportedLanguage(this.detectedLang) ? this.detectedLang : 'en',
    );
  } //  // end detectChosenLanguage() method.

  private normalizeLanguage(language: string | null): string {
    return (language || 'en').split(/[-_]/)[0].toLowerCase();
  }

  private isSupportedLanguage(language: string): boolean {
    return this.acceptedLanguages.includes(language);
  }

  private applyLanguage(language: string): void {
    this.language = language;
    document.documentElement.lang = language;
  }

  getString(key: string): string {
    if (this.languageData && this.languageData[key]) {
      return this.languageData[key];
    } else {
      // Handle missing translation
      return 'Translation not found';
    }
  } // end getString() method.

  formatString(key: string, ...params: string[]): string {
    let str = this.getString(key);
    for (let i = 0; i < params.length; i++) {
      const regex = new RegExp('%' + (i + 1), 'g');
      str = str.replace(regex, params[i]);
    }
    return str;
  } // end formatString() method.

  getFriendlyDate(currentDate: Date): string {
    // Define the options for formatting the date
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    };

    // Format the date into a friendly string
    let friendlyDateString = currentDate.toLocaleDateString(
      this.language,
      options,
    );
    return friendlyDateString;
  } // end getFriendlyDate() method.

  isMobile(): boolean {
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      ) ||
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0
    );
  } // end isMobile() method.
} // end of settings service class.
