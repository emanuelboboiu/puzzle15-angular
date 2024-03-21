import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-audio-tags',
  standalone: true,
  imports: [NgIf, NgFor],
  templateUrl: './audio-tags.component.html',
  styleUrl: './audio-tags.component.css'
})
export class AudioTagsComponent implements OnInit {
  showAudioTags: boolean = false;

  sounds: string[];

  constructor() {
    this.sounds = [
      "move",
      "blocked",
      "action",
      "winner",
      "abandon",
      "start"
    ];
  } // end constructor.

  ngOnInit(): void {
    setTimeout(() => {
      this.showAudioTags = true;
    }, 2000);
  }

} // end audio-tags component class.
