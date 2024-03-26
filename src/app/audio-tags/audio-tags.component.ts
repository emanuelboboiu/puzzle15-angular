import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { SettingsService } from '../settings.service';

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

  constructor(public settings: SettingsService) {
    this.sounds = [
      "move",
      "blocked",
      "action",
      "winner",
      "abandon",
      "start",
      "save",
      "click"
    ];
  } // end constructor.

  ngOnInit(): void {
    setTimeout(() => {
      this.showAudioTags = true;
    }, 100);
  }

} // end audio-tags component class.
