import { Component, OnInit, NgModule } from '@angular/core';
import { KeyValuePipe, NgFor, NgIf } from '@angular/common';
import { SettingsService } from '../settings.service';
import { StatisticsService } from '../statistics.service';
import { RequestsService } from '../requests.service';

@Component({
    selector: 'app-statistics',
    imports: [NgIf, NgFor, KeyValuePipe],
    templateUrl: './statistics.component.html',
    styleUrl: './statistics.component.css'
})
export class StatisticsComponent implements OnInit {
  quizzApiFileName: string = "get_stats.php";

  // For general statistics:
  generalRecord: string = "0";
  generalRecordDate: string = "...";
  generalFinishedGames: any;
  generalTotalSolved: string = "0";
  generalStartedGames: any;
  generalTotalStarted: string = "0";
  generalAverageDuration: string = "0";
  generalAverageMoves: string = "0";

  // Personal statistics:
  showPersonalStatistics: boolean = false;
  recordScore: string = "";
  recordDate: string = "";
  personalStartedGames: any;
  personalTotalStarted: string = "0";
  personalFinishedGames: any;
  personalTotalSolved: string = "0";
  personalAverageDuration: string = "0";
  personalAverageMoves: string = "0";

  constructor(public settings: SettingsService,
    private statistics: StatisticsService,
    private rqs: RequestsService) {

  } // end constructor.

  ngOnInit(): void {
    this.getGeneralStatisticsJSon();
    this.getLocalStatistics();
  } // end ngOnInit.

  // Get the general statistics JSON:
  getGeneralStatisticsJSon(): void {
    this.rqs.getDataGet(this.quizzApiFileName, '?act=getStats')
      .subscribe((json) => {
        // Set the general records and its date:
        this.generalRecord = json.generalRecord;
        this.generalRecordDate = this.settings.getFriendlyDate(new Date(json.generalRecordDate));

        // Now the started puzzles:
        this.generalStartedGames = json.startedGames;
        // Calculate the total started games:
        this.generalTotalStarted = "" + this.calculateTotalSumOfValues(this.generalStartedGames);

        // Now the solved puzzles, finished games:
        this.generalFinishedGames = json.finishedGames;
        // Calculate the total finished games:
        this.generalTotalSolved = "" + this.calculateTotalSumOfValues(this.generalFinishedGames);

        // Now the average duration and number of moves:
        this.generalAverageDuration = this.secondsToMinutesSeconds(Number(json.generalAverageDuration));
        this.generalAverageMoves = json.generalAverageMoves;
      });
  } // end getGeneralStatisticsJSon() method.

  // This method calculates the total sum of the values in an array:
  calculateTotalSumOfValues(tempArr: any): number {
    let total = 0;
    Object.values(tempArr).forEach(value => {
      total += Number(value);
    });
    return total;
  } // end calculateTotalSumOfValues() method.
  secondsToMinutesSeconds(seconds: number): string {
    const minutes: number = Math.floor(seconds / 60);
    const remainingSeconds: number = seconds % 60;
    const formattedMinutes: string = minutes < 10 ? '0' + minutes : minutes.toString();
    const formattedSeconds: string = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds.toString();
    return formattedMinutes + ':' + formattedSeconds;
  } // end secondsToMinutesSeconds() method.

  // From here local statistics, personal:
  // A method to getLocalStatistics:
  getLocalStatistics(): void {
    // We do these things only if there is at least one game saved, we check number of moves saved to be greater than 0:
    this.showPersonalStatistics = (this.settings.getNumberSetting(this.statistics.lsTotalMovesKey) > 0) ? true : false;

    if (this.showPersonalStatistics) {
      this.determineRecordScore();
      this.personalStartedGames = this.statistics.getStartedGames();
      // We need the total sum of the values:
      this.personalTotalStarted = this.calculateTotalSumOfValues(this.personalStartedGames).toString();
      this.personalFinishedGames = this.statistics.getFinishedGames();
      this.personalTotalSolved = this.calculateTotalSumOfValues(this.personalFinishedGames).toString();
      this.getPersonalAverages();
    } // end if we need to show personal statistics.
  } // end getLocalStatistics() method.

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

  // The method to detect the average duration and moves per game:
  getPersonalAverages(): void {
    let totalDuration: number = this.settings.getNumberSetting(this.statistics.lsTotalDurationKey);
    let totalMoves: number = this.settings.getNumberSetting(this.statistics.lsTotalMovesKey);
    // We have the total number of games already charged:
    this.personalAverageDuration = this.secondsToMinutesSeconds(Math.round(totalDuration / Number(this.personalTotalSolved)));
    this.personalAverageMoves = String(Math.round(totalMoves / Number(this.personalTotalSolved)));
  }   // end getPersonalAverages method.

} // end class.
