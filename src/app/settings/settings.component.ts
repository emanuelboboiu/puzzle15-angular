import { Component, OnInit, NgModule } from '@angular/core';
import { NgFor, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { SettingsService } from '../settings.service';
import { PlayerService } from '../player.service';

@Component({
  selector: 'app-settings',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent implements OnInit {
  tempSelectedLanguage: string;
  tempSelectedSoundScheme: string;
  soundVolume: number = 0.7;
  isSound: boolean = true;
  isAccessibility: boolean = false;
  isGestures: boolean = true;

  constructor(public settings: SettingsService, private player: PlayerService) {
    this.tempSelectedLanguage = this.settings.language;
    this.tempSelectedSoundScheme = this.settings.soundScheme;
  } // end constructor.

  ngOnInit(): void {
    this.isSound = this.settings.isSound;
    this.isAccessibility = this.settings.isAccessibility;
    this.isGestures = this.settings.isGestures;
    this.tempSelectedSoundScheme = this.settings.soundScheme;
    this.soundVolume = this.settings.soundVolume;
  } // end of NgOnInit() method.

  saveSoundsChoice(): void {
    // The click to be played a little later:
    setTimeout(() => {
      this.player.play('click');
    }, 300);
    this.settings.isSound = this.isSound;
    this.settings.saveBooleanSetting(
      this.settings.lsIsSoundKey,
      this.settings.isSound
    );
  } // end of saveSoundsChoice() method.

  saveAccessibilityChoice(): void {
    this.player.play('click');
    this.settings.isAccessibility = this.isAccessibility;
    this.settings.saveBooleanSetting(
      this.settings.lsIsAccessibilityKey,
      this.settings.isAccessibility
    );
  } // end of saveAccessibilityChoice() method.

  saveGesturesChoice(): void {
    this.player.play('click');
    this.settings.isGestures = this.isGestures;
    this.settings.saveBooleanSetting(
      this.settings.lsIsGesturesKey,
      this.settings.isGestures
    );
  } // end of saveGesturesChoice() method.

  saveLanguage(): void {
    this.player.play('action');
    this.settings.language = this.tempSelectedLanguage;
    this.settings.saveStringSetting(
      this.settings.preferredLangKey,
      this.tempSelectedLanguage
    );
    // Reload the component after a short while, to have time the sound to be played:
    setTimeout(() => {
      window.location.reload();
    }, 400);
  } // end saveLanguage() method.

  saveSoundScheme(): void {
    this.settings.soundScheme = this.tempSelectedSoundScheme;
    this.settings.saveStringSetting(
      this.settings.lsSoundSchemeKey,
      this.tempSelectedSoundScheme
    );
    this.player.play('action');
  } // end saveSoundScheme() method.

  saveVolumeChoice(): void {
    this.settings.soundVolume = this.soundVolume;
    this.settings.saveNumberSetting(
      this.settings.lsSoundVolumeKey,
      this.soundVolume
    );
    this.player.play('click');
  } // end of saveVolumeChoice() method.
} // end settings component class.
