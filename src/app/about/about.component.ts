import { Component, NgModule } from '@angular/core';
import { SettingsService } from '../settings.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {

  constructor(public settings: SettingsService) {

  } // end constructor.

}
