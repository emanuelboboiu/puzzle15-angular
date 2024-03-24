import { Injectable } from '@angular/core';
import { timeout } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  isDev = false; // not to have many stats in development mode.
  os: number = 0; // 0 means web, 1 means iOS, 2 means Android.
  language: string = "ro";
  languageData: any;
  isSound: boolean = true;
  lsIsSoundKey: string = "lsSettingsSound";
  isAccessibility: boolean = false;
  lsIsAccessibilityKey: string = "lsSettingsAccessibility";

  constructor(private http: HttpClient,
    private sanitizer: DomSanitizer) {
    this.loadSettingsFromLocalStorage();
  } // end constructor.

  // A method to load the settings from local storage:
  loadSettingsFromLocalStorage(): void {
    if (this.lsExists(this.lsIsSoundKey)) {
      this.isSound = this.getBooleanSetting(this.lsIsSoundKey);
    } else {
      this.isSound = true;
    }
    if (this.lsExists(this.lsIsAccessibilityKey)) {
      this.isAccessibility = this.getBooleanSetting(this.lsIsAccessibilityKey);
    } else {
      this.isAccessibility = false;
    }
    // Load language data (e.g., English)
    this.loadLanguage(this.language).subscribe(data => {
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

  // Some methods to convert values and save and get them from localStorage:
  convertBooleanToString(value: boolean): string {
    return value == true ? "1" : "0";
  } // end convertBooleanToString() method.

  convertStringToBoolean(value: string): boolean {
    return value == "1" ? true : false;
  } // end convertStringToBoolean() method.

  // Methods for translation:
  loadLanguage(lang: string): Observable<any> {
    return this.http.get<any>(`/assets/i18n/${lang}.json`);
  } // end loadLanguage() method.

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

} // end of settings service class.
