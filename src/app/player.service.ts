import { Injectable } from '@angular/core';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  constructor(private settings: SettingsService) {

  } // end constructor.

  // This method plays the sounds in general:
  public play(soundName: string): void {
    if (this.settings.isSound) {
      let p = <HTMLAudioElement>document.getElementById(soundName);
      p.currentTime = 0;
      p?.play();
    } // end if sounds are enabled in settings.
  } // end play() method.

} // end of player service class.
