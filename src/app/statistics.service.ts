import { Injectable } from '@angular/core';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  lsRecordKey: string = "recordScore";
  lsRecordDateKey: string = "recordDate"

  constructor(private settings: SettingsService) {

  } // end constructor.

  // A method to calculate the score:
  calculateFinalScore(boardSize: number, moves: number, seconds: number): number {
    let baseScore = 1000;
    let penaltyPerMove = 6 - boardSize; // To have 3, 2 or 1, depending of the board size difficulty.
    let penaltyPerTenSeconds = 6 - boardSize; // also to have 3, 2, or 1.
    let tenSecondsIntervals = Math.round(seconds / 10); // how many of ten seconds intervals we have.
    let score = baseScore - (penaltyPerMove * moves) - (penaltyPerTenSeconds * tenSecondsIntervals)

    // Now check if we save it in the localStorage:
    this.checkIfNewRecord(score);
    return score;
  } // end calculateFinalScore() method.

  checkIfNewRecord(newScore: number) {
    let oldRecord: number = this.settings.getNumberSetting(this.lsRecordKey);
    if (newScore > oldRecord) {
      this.settings.saveNumberSetting(this.lsRecordKey, newScore);
      // Save also current date:
      const currentDate = new Date();
      // Convert the date to a string and save it in localStorage
      this.settings.saveStringSetting(this.lsRecordDateKey, currentDate.toString());
    } // end if new record exists.
  } // end checkIfNewRecord() method.

} // end statistics service class.
