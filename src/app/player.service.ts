import { Injectable } from '@angular/core';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private audioPlayer: HTMLAudioElement;

  constructor(private settings: SettingsService) {
    this.audioPlayer = new Audio();
  } // end constructor.

  // This method plays the sounds in general:
  play(soundFileName: string): void {
    if (this.settings.isSound) {
      const soundScheme = this.settings.soundScheme;
      const soundFilePath = `assets/sounds/${soundScheme}/${soundFileName}.mp3`;
      this.audioPlayer.src = soundFilePath;
      this.audioPlayer.volume = this.settings.soundVolume;
      this.audioPlayer.load();
      this.audioPlayer.play();
    } // end if sound are enabled in settings.
  } // end play() method.

  // A method to play sounds with directional audio effects:
  playSoundInDirection(
    soundFileName: string,
    direction: 'up' | 'down' | 'left' | 'right'
  ): void {
    if (!this.settings.isSound) return;

    const soundScheme = this.settings.soundScheme;
    const soundFilePath = `assets/sounds/${soundScheme}/${soundFileName}.mp3`;

    const audioContext = new AudioContext();
    fetch(soundFilePath)
      .then((res) => res.arrayBuffer())
      .then((data) => audioContext.decodeAudioData(data))
      .then((buffer) => {
        const source = audioContext.createBufferSource();
        source.buffer = buffer;

        const panner = audioContext.createStereoPanner();
        const gain = audioContext.createGain();

        const now = audioContext.currentTime;
        const duration = buffer.duration;

        // defaults
        let startPan = 0;
        let endPan = 0;
        let startRate = 1;
        let endRate = 1;

        switch (direction) {
          case 'left':
            startPan = 0.6;
            endPan = 0.1;
            break;
          case 'right':
            startPan = 0.3;
            endPan = 0.6;
            break;
          case 'up':
            startRate = 1.0;
            endRate = 1.2;
            break;
          case 'down':
            startRate = 1.0;
            endRate = 0.8;
            break;
        }

        // Animate pan or pitch over the duration
        panner.pan.setValueAtTime(startPan, now);
        panner.pan.linearRampToValueAtTime(endPan, now + duration);

        source.playbackRate.setValueAtTime(startRate, now);
        source.playbackRate.linearRampToValueAtTime(endRate, now + duration);

        gain.gain.value = this.settings.soundVolume;

        source.connect(panner);
        panner.connect(gain);
        gain.connect(audioContext.destination);

        source.start(0);
      })
      .catch((err) => console.error('Error playing directional sound', err));
  } // end playSoundInDirection() method.
} // end of player service class.
