import { Component, OnInit, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { SettingsService } from '../settings.service';
import { NgModel } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  isSound: boolean = true;
  isAccessibility: boolean = false;

  constructor(public settings: SettingsService) {

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

} // end settings component class.
