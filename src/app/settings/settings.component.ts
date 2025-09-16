import { Component, OnInit, NgModule } from '@angular/core';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { SettingsService } from '../settings.service';
import { PlayerService } from '../player.service';

@Component({
    selector: 'app-settings',
    imports: [FormsModule, NgFor],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  tempSelectedLanguage: string;
  isSound: boolean = true;
  isAccessibility: boolean = false;
  isGestures: boolean = true;

  constructor(public settings: SettingsService,
    private player: PlayerService) {
    this.tempSelectedLanguage = this.settings.language;
  } // end constructor.

  ngOnInit(): void {
    this.isSound = this.settings.isSound;
    this.isAccessibility = this.settings.isAccessibility;
    this.isGestures = this.settings.isGestures;
  } // end of NgOnInit() method.

  saveSoundsChoice(): void {
    // The click to be played a little later:
    setTimeout(() => {
      this.player.play('click');
    }, 300);
    this.settings.isSound = this.isSound;
    this.settings.saveBooleanSetting(this.settings.lsIsSoundKey, this.settings.isSound)
  } // end of saveSoundsChoice() method.

  saveAccessibilityChoice(): void {
    this.player.play('click');
    this.settings.isAccessibility = this.isAccessibility;
    this.settings.saveBooleanSetting(this.settings.lsIsAccessibilityKey, this.settings.isAccessibility)
  } // end of saveAccessibilityChoice() method.

  saveGesturesChoice(): void {
    this.player.play('click');
    this.settings.isGestures = this.isGestures;
    this.settings.saveBooleanSetting(this.settings.lsIsGesturesKey, this.settings.isGestures)
  } // end of saveGesturesChoice() method.

  saveLanguage(): void {
    this.player.play('action');
    this.settings.language = this.tempSelectedLanguage;
    this.settings.saveStringSetting(this.settings.preferredLangKey, this.tempSelectedLanguage);
    // Reload the component after a short while, to have time the sound to be played:
    setTimeout(() => {
      window.location.reload();
    }, 400);
  } // end saveLanguage() method.

} // end settings component class.
