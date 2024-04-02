import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../settings.service';
import { StatisticsService } from '../statistics.service';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.css'
})
export class StatisticsComponent implements OnInit {
  recordScore: string = "";
  recordDate: string = "";

  constructor(public settings: SettingsService,
    private statistics: StatisticsService) {

  } // end constructor.

  ngOnInit(): void {
    this.determineRecordScore();
  } // end ngOnInit.

  // Get the record and the date:
  determineRecordScore() {
    // Retrieve the recordScore:
    if (this.settings.lsExists(this.statistics.lsRecordKey)) {
      this.recordScore = this.settings.getStringSetting(this.statistics.lsRecordKey);
    }

    // Retrieve the saved date from localStorage if it exists:
    if (this.settings.lsExists(this.statistics.lsRecordDateKey)) {
      const savedDate = this.settings.getStringSetting(this.statistics.lsRecordDateKey);
      // Convert the date string back to a Date object
      const dateObject = new Date(savedDate!);
      this.recordDate = this.settings.getFriendlyDate(dateObject);
    } // end if record date exists in localStorage.
  } // end determineRecordScore() method.

} // end class.
