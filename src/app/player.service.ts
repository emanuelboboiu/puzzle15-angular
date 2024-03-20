import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  constructor() { }
  // This method plays the sounds in general:
  public play(soundName: string): void {
    let p = <HTMLAudioElement>document.getElementById(soundName);
    p.currentTime = 0;
    p?.play();
  } // end play() method.

} // end of player service class.
