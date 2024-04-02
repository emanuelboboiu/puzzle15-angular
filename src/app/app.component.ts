import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  NgModule,
} from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { SettingsComponent } from './settings/settings.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { StatisticsService } from './statistics.service';
import { AboutComponent } from './about/about.component';
import { RequestsService } from './requests.service';
import { piece } from './piece.type';
import { timer, Subscription } from 'rxjs';
import party from 'party-js';
import { PlayerService } from './player.service';
import { SettingsService } from './settings.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, SettingsComponent, StatisticsComponent, AboutComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  title = '15 Puzzle';
  apiFileName: string = 'insert_stats.php';
  currSection: number = 0; // 0 means main page, 1 means the game zone etc.
  boardSize: number = 4;
  pieces: piece[] = []; //array of puzzle pieces.
  distanceX = 0; //the distance the moving piece should go on x axis
  distanceY = 0; //the distance the moving piece should go on y axis
  selectedPiece!: piece;
  disable = false; //this is for disableing the click function while the pieces are moving.
  screenWidth!: number;
  nrMoves: number = 0; // how many moves were in an abandoned or solved game.
  initialNrMoves: number = 0; // to know what number of moves we have at the start of a new or saved session.
  timerValueSec = 0;
  timerSubscription: Subscription = new Subscription();
  gameStarted = false;
  gameWon = false;
  askIfAbandon = false;
  showMessageSavedGame: boolean = false;
  alphabet: string[] = 'ABCDE'.split('');
  ariaLabels: string[] = [];
  isSavedGame: boolean = false;
  finalScore: number = 0;

  constructor(
    private player: PlayerService,
    public settings: SettingsService,
    private statistics: StatisticsService,
    private rqs: RequestsService
  ) {
    this.screenWidth = window.innerWidth;
  } // end constructor.

  ngOnInit(): void {
    // We check if there is a saved game - a not finished one or not abandoned:
    this.checkIfThereIsSavedGame();
  } // end ngOnInit() method.

  ngOnDestroy(): void {
    this.timerSubscription.unsubscribe();
  } // end ngOnDestroy() method.

  //hook for finding window size.
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.screenWidth = window.innerWidth;
  } //end of @HostListener() hook.

  // this method creates the pieces.
  createBoard(): void {
    this.pieces = []; //here I initialize the array with an empty one.

    for (let i = 1; i < this.boardSize * this.boardSize; i++) {
      this.pieces.push({ number: i, x: 0, y: 0 }); //here I create new pieces with no x and y.
    }

    this.pieces.push({ number: 0, x: 0, y: 0 }); //here I create the 0 piece to make it the last one.

    let k = 0; //counter for pieces array index.
    //here i give the pieces x and y values to be organized like a matrix.
    for (let i = 1; i <= this.boardSize; i++) {
      for (let j = 1; j <= this.boardSize; j++) {
        this.pieces[k].x = i;
        this.pieces[k].y = j;
        k++;
      }
    }
  } //end of createBoard() method.

  //this method tries and move the pieces.
  move(piece: piece) {
    //verify if the pieces are moving and game started.
    if (this.disable == false && this.gameStarted) {
      this.selectedPiece = piece;
      //index of the 0 piece.
      const zeroIndex = this.findPieceIndexByNumber(0);
      //reset x and y distance.
      this.distanceX = 0;
      this.distanceY = 0;
      //I use this to find the distance between the selected piece and 0 piece.
      let x = this.pieces[zeroIndex].x - piece.x;
      let y = this.pieces[zeroIndex].y - piece.y;
      //here I check if the distance on just one of the axis is 1.
      if (Math.abs(x) + Math.abs(y) == 1) {
        this.player.play('move');
        this.nrMoves++; // we increment the number of moves.

        const pieceIndex = this.findPieceIndexByNumber(piece.number);

        const boardWidth =
          this.screenWidth >= 750 ? 520 : (70 / 100) * this.screenWidth;

        //some formulas to calculate the distance given the size of the board.
        this.distanceX =
          ((boardWidth - (this.boardSize + 1) * 10) / this.boardSize + 10) * y;
        this.distanceY =
          ((boardWidth - (this.boardSize + 1) * 10) / this.boardSize + 10) * x;
        this.distanceX = Math.round(this.distanceX);
        this.distanceY = Math.round(this.distanceY);

        //disable the buttons.
        this.disable = true;
        //we actually move the pieces after 0.3s to wait for the transition to be done.
        setTimeout(() => {
          let aux = this.pieces[pieceIndex].number;
          this.pieces[pieceIndex].number = this.pieces[zeroIndex].number;
          this.pieces[zeroIndex].number = aux;
          this.disable = false;
          this.refillAriaLabels();
          this.verifyWin();
        }, 300);
        setTimeout(() => {
          var element: any =
            document.getElementsByClassName('invisible-piece')[0];
          element.style.transform = 'none';
        }, 301);
      } else {
        // not moved:
        this.player.play('blocked');
      }
    }
  } //end of move() method.

  //a method to verify if the game is won.
  verifyWin(): void {
    if (this.gameStarted) {
      let ok = true; //variable to verify if the pieces are placed correctly.
      for (let i = 0; i < this.boardSize * this.boardSize - 1; i++) {
        if (this.pieces[i].number !== i + 1) {
          ok = false;
          break;
        }  // end if no number in succession.
      } // end for.
      if (ok === true) {
        this.finalScore = this.statistics.calculateFinalScore(this.boardSize, this.nrMoves, this.timerValueSec);
        this.insertStats('2'); // 1 means a start, 2 means finish/won, 3 means abandon, 4 means saved.
        this.settings.saveBooleanSetting(this.settings.isSavedGameKey, false);
        this.isSavedGame = false;
        this.timerSubscription.unsubscribe(); //stop the timer.
        this.gameWon = true;
        this.player.play('winner');
        this.gameStarted = false;
        this.askIfAbandon = false;

        party.confetti(document.getElementById('confetti')!); // throw confetti
      }
    }
  } //end of verifyWin() method.

  // A method to check if there is a saved game:
  checkIfThereIsSavedGame(): void {
    if (
      this.settings.lsExists(this.settings.isSavedGameKey) &&
      this.settings.getBooleanSetting(this.settings.isSavedGameKey)
    ) {
      this.isSavedGame = true;
      // It is sure that we also have the size of the board saved:
      this.boardSize = Number(
        this.settings.getStringSetting(this.settings.savedBoardSizeKey)
      );
      this.nrMoves = Number(
        this.settings.getStringSetting(this.settings.savedMovesKey)
      );
      this.initialNrMoves = this.nrMoves;
      this.timerValueSec = parseInt(
        this.settings.getStringSetting(this.settings.savedSecondsKey)
      );
      // alert("" + this.timerValueSec);
      this.currSection = 2;
      this.startGame();
    } // end if a saved game exists.
  } // end checkIfThereIsSavedGame() method.

  // This method save a game if it is not fnished or abandoned:
  saveCurrentGame(): void {
    if (this.gameStarted) {
      // We show the message for some seconds:
      this.showMessageSavedGame = true;
      setTimeout(() => {
        this.showMessageSavedGame = false;
      }, 5000);

      // We save the value of the game during playing:
      this.settings.saveBooleanSetting(this.settings.isSavedGameKey, true);
      this.settings.saveStringSetting(
        this.settings.savedBoardSizeKey,
        String(this.boardSize)
      );
      this.settings.saveStringSetting(
        this.settings.savedMovesKey,
        String(this.nrMoves)
      );
      this.initialNrMoves = this.nrMoves;
      this.settings.saveStringSetting(
        this.settings.savedSecondsKey,
        String(this.timerValueSec)
      );
      let tempBoardNumbers: string[] = [];
      for (let i = 0; i < this.pieces.length; i++) {
        tempBoardNumbers.push(this.pieces[i].number.toString());
      } // end for.
      let temp = tempBoardNumbers.join('|');
      this.settings.saveStringSetting(this.settings.savedBoardNumbersKey, temp);
      this.player.play('save');
    } // end if the game is started.
  } // end saveCurrentGame() method.

  // Method for starting the game.
  startGame(): void {
    this.createBoard();
    this.setPuzzleNumbers(); // this generate a new array of number if not saved, or charges the saved one.
    this.startTimer();
    this.gameStarted = true;
    this.gameWon = false;
    this.refillAriaLabels();
  } // end of startGame() method.

  // A method used to go to main page.
  goToMain(): void {
    this.currSection = 0;
  } // end goToMain() method.

  // A method used to go to a page where you select the board size.
  goToSelectBoardSize(): void {
    this.player.play('action');
    this.currSection = 1;
  } // end goToSelectBoardSize() method.

  // A method used to go back to main page from settings or other sections excluding game zone:
  goBackToMain(): void {
    this.player.play('action');
    this.currSection = 0;
    this.gameWon = false; // after a game is won, to disappear for the next time the congrats message.
  } // end of goBackToMain() method.

  // A method used to go to game board zone.
  goToGame(size: number): void {
    this.player.play('action');
    this.boardSize = size; // the size comes from the html button clickedf.
    this.nrMoves = 0;
    this.currSection = 2;
    this.fillAriaLabels();
    this.createBoard();
    this.timerValueSec = 0;
    this.timerSubscription.unsubscribe();
  } // end of goToGame() method.

  // Here 3 methods for abandon the game:
  askForAbandon(): void {
    // this is called clicking the Abandon button:
    this.player.play('action');
    this.askIfAbandon = true;
  } // end of askForAbandon() method.

  abandonEffectively(): void {
    // this is called when pressing yes for abandon:
    this.player.play('abandon');
    this.askIfAbandon = false;
    this.gameWon = false;
    this.gameStarted = false;
    // We set in the localStorage that there is no started game:
    this.settings.saveBooleanSetting(this.settings.isSavedGameKey, false);
    this.isSavedGame = false;
    this.insertStats('3'); // 1 means a start, 2 means finish/won, 3 means abandon.
    this.goToMain();
  } // end of abandonEffectively() method.

  dontAbandon(): void {
    // this is called when clicking No for abandon:
    this.player.play('action');
    this.askIfAbandon = false;
  } // end of dontAbandon() method.

  // The method to go to settings:
  goToSettings(): void {
    this.player.play('action');
    this.currSection = 3;
  } // end of goToSettings() method.

  // The method to go to about:
  goToAbout(): void {
    this.player.play('action');
    this.currSection = 4;
  } // end of goToAbout() method.

  // The method to go to statistics:
  goToStatistics(): void {
    this.player.play('action');
    this.currSection = 5;
  } // end of goToStatistics() method.

  // A method to set the numbers on the board, new or saved:
  setPuzzleNumbers() {
    let boardNumbers: number[] = [];
    if (this.isSavedGame) {
      // We already have the board size, the number of moves and the timer seconds are charged in checkIfThereIsSavedGame() method..
      // We get here only the numbers of the pieces:
      let tempB = this.settings.getStringSetting(
        this.settings.savedBoardNumbersKey
      );
      let tempArrB = tempB.split('|');
      for (let i = 0; i < tempArrB.length; i++) {
        boardNumbers.push(parseInt(tempArrB[i]));
      } // end for.
      this.insertStats('4'); // 4 means restart (saved game).
    } else {
      // there is a new game, not a saved one:
      // If is a new board:
      this.player.play('start');
      this.nrMoves = 0; // we reset the number of moves for stats to 0.
      this.initialNrMoves = 0;
      // We need an array of arranged numbers:
      for (let i = 1; i < this.boardSize * this.boardSize; i++) {
        boardNumbers.push(i);
      } // end for.
      boardNumbers.push(0); // we also add the 0 value at the end.
      // Now shuffle it in a do while, until it is solvable::
      // Create another array for work, if it is not solvable to begin att the start with the shuffle:
      let tempBoardNumbers: number[] = [];
      do {
        tempBoardNumbers = boardNumbers;
        tempBoardNumbers = this.shuffleArray(tempBoardNumbers);
      } while (!this.isSolvable(tempBoardNumbers));
      boardNumbers = tempBoardNumbers;
      this.insertStats('1'); // 1 means a start, 2 means finish/won, 3 means abandon.
    } // end if is not a saved started game.
    // Fill now the board effectively, no matter if saved or new:
    for (let i = 0; i < this.pieces.length; i++) {
      this.pieces[i].number = boardNumbers[i]; // t fill correctly.
    } // end for.
  } // end setPuzzleNumbers() method.

  // A method to shuffle the array of numbers..
  shuffleArray(arr: number[]): number[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    } // end for.
    return arr;
  } //end of shuffleArray() method.

  //method for starting the timer
  startTimer() {
    //unsubscribe to any existing timer to avoid multiple timers running.
    this.timerSubscription.unsubscribe();

    //start a new timer.
    if (!this.isSavedGame) {
      this.timerValueSec = 0; // reset timer value.
    }

    const initialValue = this.timerValueSec || 0; // Set initial value to timerValueSec if available, otherwise 0
    // Calculate the initial delay based on the difference between the initial value and 0
    const initialDelay = initialValue > 0 ? (1000 - (initialValue * 1000) % 1000) : 1000;
    const source = timer(initialDelay, 1000); // Start after calculated initial delay, emit every 1 second.
    this.timerSubscription = source.subscribe((val) => {
      this.timerValueSec = initialValue + val; // Update timer value
    });
  } //end of startTimer() method.

  //this method finds the index of a piece in array by its number.
  findPieceIndexByNumber(number: number) {
    for (let i = 0; i < this.pieces.length; i++) {
      if (this.pieces[i].number === number) {
        return i;
      }
    }
    return -1;
  } //end of findPieceIndexByNumber() method.

  //method for showing timer numbers with 2 digits.
  padNumber(value: number): string {
    return String(Math.floor(value)).padStart(2, '0');
  } //end of padNumber() method.

  getAriaLabel(index: number): string {
    const row = Math.floor(index / this.boardSize) + 1;
    const column = (index % this.boardSize) + 1;
    const columnLabel = this.alphabet[column - 1];
    return columnLabel + row;
  } // end getAriaLabel() method.

  fillAriaLabels(): void {
    if (this.settings.isAccessibility) {
      this.ariaLabels = [];
      for (let i = 0; i < this.boardSize * this.boardSize; i++) {
        let currNum =
          i < this.boardSize * this.boardSize - 1
            ? '' + (i + 1)
            : this.settings.getString('LABEL_EMPTY');
        this.ariaLabels.push('' + currNum + ', ' + this.getAriaLabel(i));
      } // end for.
    } // end if isAccessibility enabled.
  } // end fillAriaLabels() method.

  refillAriaLabels(): void {
    if (this.settings.isAccessibility) {
      setTimeout(() => {
        this.ariaLabels = [];
        for (let i = 0; i < this.boardSize * this.boardSize; i++) {
          let currNum = document.getElementById('pos' + i)?.innerHTML;
          if (Number(currNum) == 0) {
            currNum = this.settings.getString('LABEL_EMPTY');
          }
          this.ariaLabels.push('' + currNum + ', ' + this.getAriaLabel(i));
        } // end for.
      }, 350);
    } // end if isAccessibility enabled.
  } // end refillAriaLabels() method.

  insertStats(status: string): void {
    // status 1 means started, 2 finished, 3 abandoned.
    // We insert efectivelly in the DB only if it is not development mode:
    if (!this.settings.isDev) {
      this.rqs
        .getDataGet(
          this.apiFileName,
          '?act=insStats&status=' +
          status +
          '&boardSize=' +
          this.boardSize +
          '&score=' +
          this.finalScore +
          '&duration=' +
          this.timerValueSec +
          '&moves=' +
          this.nrMoves +
          '&os=' +
          this.settings.os +
          '&language=' +
          this.settings.language
        )
        .subscribe((json) => {
          // do nothing in lambda yet.
        });
    } // end if it is not development mode.
  } // end insertStats() method.

  // A method that calculates if the puzzle is solvable:
  isSolvable(puzzle: number[]): boolean {
    const size = Math.sqrt(puzzle.length); // Assuming the puzzle size is a perfect square + 1 (e.g., 16 for 4x4 puzzle).
    let inversions = 0;
    let rowWithBlank = 0;

    for (let i = 0; i < puzzle.length; i++) {
      if (puzzle[i] === 0) {
        // Find the row number containing the blank space
        rowWithBlank = Math.floor(i / size) + 1;
        continue;
      }
      for (let j = i + 1; j < puzzle.length; j++) {
        if (puzzle[i] > puzzle[j] && puzzle[j] !== 0) {
          inversions++;
        }
      }
    }

    // If the grid size is odd, the number of inversions must be even
    if (size % 2 === 1) {
      return inversions % 2 === 0;
    } else {
      // If the grid size is even
      // If the blank is on an even row counting from the bottom (zero-indexed), then the number of inversions must be odd
      // If the blank is on an odd row counting from the bottom (zero-indexed), then the number of inversions must be even
      return (inversions + rowWithBlank) % 2 === 0;
    }
  } // end isSolvablePuzzle() method.

} // end class.
