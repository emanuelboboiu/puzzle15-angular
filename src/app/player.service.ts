import { Injectable } from '@angular/core';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private audioPlayer: HTMLAudioElement;

  constructor(private settings: SettingsService) {
    this.audioPlayer = new Audio();
  } // end constructor.

  // This method plays the sounds in general:
  play(soundFileName: string): void {
    if (this.settings.isSound) {
      const soundFilePath = `assets/sounds/${soundFileName}.mp3`;
      this.audioPlayer.src = soundFilePath;
      this.audioPlayer.load();
      this.audioPlayer.play();
    } // end if sound are enabled in settings.
  } // end play() method.

} // end of player service class.
