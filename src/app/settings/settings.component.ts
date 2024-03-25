import { Component, OnInit, NgModule } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { SettingsService } from '../settings.service';
import { NgModel } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, NgClass],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  tempSelectedLanguage: string;
  isSound: boolean = true;
  isAccessibility: boolean = false;

  constructor(public settings: SettingsService) {
    this.tempSelectedLanguage = this.settings.language;
  } // end constructor.

  ngOnInit(): void {
    this.isSound = this.settings.isSound;
    this.isAccessibility = this.settings.isAccessibility;
  } // end of NgOnInit() method.

  saveSoundsChoice(): void {
    this.settings.isSound = this.isSound;
    this.settings.saveBooleanSetting(this.settings.lsIsSoundKey, this.settings.isSound)
  } // end of saveSoundsChoice() method.

  saveAccessibilityChoice(): void {
    this.settings.isAccessibility = this.isAccessibility;
    this.settings.saveBooleanSetting(this.settings.lsIsAccessibilityKey, this.settings.isAccessibility)
  } // end of saveAccessibilityChoice() method.

  saveLanguage(): void {
    this.settings.language = this.tempSelectedLanguage;
    this.settings.saveStringSetting(this.settings.preferredLangKey, this.tempSelectedLanguage);
    // Reload the component
    window.location.reload();
  } // end saveLanguage() method.

} // end settings component class.
