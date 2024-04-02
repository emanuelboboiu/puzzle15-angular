import { Injectable } from '@angular/core';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  lsRecordKey: string = "recordScore";
  lsRecordDateKey: string = "recordDate"
  lsTotalMovesKey: string = "lsTotalMoves";
  lsTotalDurationKey: string = "lsTotalDuration";
  lsPrefixStartedKey: string = "started";
  lsPrefixFinishedKey: string = "finished";

  constructor(private settings: SettingsService) {

  } // end constructor.

  // A method to calculate the score:
  calculateFinalScore(boardSize: number, moves: number, seconds: number): number {
    let baseScore = 1000;
    let penaltyPerMove = 6 - boardSize; // To have 3, 2 or 1, depending of the board size difficulty.
    let penaltyPerTenSeconds = 6 - boardSize; // also to have 3, 2, or 1.
    let tenSecondsIntervals = Math.round(seconds / 10); // how many of ten seconds intervals we have.
    let score = baseScore - (penaltyPerMove * moves) - (penaltyPerTenSeconds * tenSecondsIntervals)
    // We don't allow negative values, minimum is 0:
    if (score < 0) {
      score = 0;
    }
    // Now check if we save it in the localStorage:
    this.checkIfNewRecord(score);
    // Also insert the information in the local storage for finished games:
    this.insertLocalStatsFinishedGames(boardSize, seconds, moves);
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

  // A method to insert a started here local, depending of the board size to increment for each size:
  insertLocalStatsStartedGames(boardSize: number): void {
    let currStarted = this.settings.getNumberSetting(this.lsPrefixStartedKey + boardSize);
    currStarted++; // increment with one.
    this.settings.saveNumberSetting(this.lsPrefixStartedKey + boardSize, currStarted); // we saved back plus one.
  } // end insertLocalStatsStartedGames() method.

  // A method to set in the localStorage duration, moves and type of boards played, how many:
  insertLocalStatsFinishedGames(boardSize: number, duration: number, moves: number): void {
    let currFinished = this.settings.getNumberSetting(this.lsPrefixFinishedKey + boardSize);
    currFinished++; // increment with one.
    this.settings.saveNumberSetting(this.lsPrefixFinishedKey + boardSize, currFinished); // we saved back plus one.
    // Now add to total duration:
    let currDuration = this.settings.getNumberSetting(this.lsTotalDurationKey);
    currDuration += duration;
    this.settings.saveNumberSetting(this.lsTotalDurationKey, currDuration);
    // Now add to total number of moves:
    let currMoves = this.settings.getNumberSetting(this.lsTotalMovesKey);
    currMoves += moves;
    this.settings.saveNumberSetting(this.lsTotalMovesKey, currMoves);
  } // end insertLocalStatsFinishedGames() method.

  getFinishedGames(): any {
    const dynamicObject: any = {};
    // Loop through keys from 3 to 5, the possible board sizes:
    for (let key = 3; key <= 5; key++) {
      if (this.settings.lsExists(this.lsPrefixFinishedKey + key)) {
        let value: string = this.settings.getStringSetting(this.lsPrefixFinishedKey + key);
        dynamicObject[key] = value;
      } // end there is at least a finished game with this board size.
    } // end for.
    return dynamicObject;
  } // end getFinishedGames() method.

  getStartedGames(): any {
    const dynamicObject: any = {};
    // Loop through keys from 3 to 5, the possible board sizes:
    for (let key = 3; key <= 5; key++) {
      if (this.settings.lsExists(this.lsPrefixStartedKey + key)) {
        let value: string = this.settings.getStringSetting(this.lsPrefixStartedKey + key);
        dynamicObject[key] = value;
      } // end there is at least a finished game with this board size.
    } // end for.
    return dynamicObject;
  } // end getFinishedGames() method.

} // end statistics service class.
