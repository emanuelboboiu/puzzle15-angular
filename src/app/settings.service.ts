import { Injectable } from '@angular/core';
import { timeout } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  isDev = false; // not to have many stats in development mode.
  os: number = 0; // 0 means web, 1 means iOS, 2 means Android.
  language: string = "en";
  isSound: boolean = true;
  lsIsSoundKey: string = "lsSettingsSound";
  isAccessibility: boolean = false;
  lsIsAccessibilityKey: string = "lsSettingsAccessibility";

  constructor() {
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

} // end of settings service class.
