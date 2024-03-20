import { Component } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-audio-tags',
  standalone: true,
  imports: [NgFor],
  templateUrl: './audio-tags.component.html',
  styleUrl: './audio-tags.component.css'
})
export class AudioTagsComponent {
  sounds: string[];

  constructor() {
    this.sounds = [
      "action",
      "appearance",
      "beep_sound",
      "blocked",
      "close_menu",
      "open_menu",
      "positive"
    ];
  } // end constructor.


} // end audio-tags component class.
