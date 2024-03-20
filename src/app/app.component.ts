import { Component, HostListener, NgModule } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { AudioTagsComponent } from './audio-tags/audio-tags.component';
import { RequestsService } from './requests.service';
import { piece } from './piece.type';
import { timer, Subscription } from 'rxjs';
import party from 'party-js';
import { PlayerService } from './player.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, AudioTagsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = '15 Puzzle';
  currSection: number = 0; // 0 means main page, 1 means the game zone etc.
  boardSize: number = 4;
  pieces: piece[] = []; //array of puzzle pieces.
  distanceX = 0; //the distance the moving piece should go on x axis
  distanceY = 0; //the distance the moving piece should go on y axis
  selectedPiece!: piece;
  disable = false; //this is for disableing the click function while the pieces are moving.
  screenWidth!: number;
  timerValueSec = 0;
  timerSubscription: Subscription = new Subscription();
  gameStarted = false;
  gameWon = false;

  constructor(private player: PlayerService) {
    this.screenWidth = window.innerWidth;
  } // end constructor.

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
        this.player.play("action");

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
          this.verifyWin();
        }, 300);
      } else { // not moved:
        this.player.play("blocked");
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
        }
      }
      if (ok === true) {
        this.timerSubscription.unsubscribe(); //stop the timer.
        this.gameWon = true;
        this.player.play("finished");
        party.confetti(document.getElementById('confetti')!); //throw confetti
      }
    }
  } //end of verifyWin() method.

  // Method for starting the game.
  startGame(): void {
    this.player.play("positive");
    this.createBoard();
    this.shuffleArray();
    this.startTimer();
    this.gameStarted = true;
    this.gameWon = false;
  } // end of startGame() method.

  // A method used to go to main page.
  goToMain(): void {
    this.player.play("close");
    this.currSection = 0;
    this.gameWon = false;
    this.gameStarted = false;
  } // end goToMain() method.

  // A method used to go to game board zone.
  goToGame(size: number): void {
    this.player.play("open");
    this.boardSize = size; // the size comes from the html button clickedf.
    this.currSection = 1;
    this.createBoard();
    this.timerValueSec = 0;
    this.timerSubscription.unsubscribe();
  } // end goToGame() method.

  //a method to put pieces in a random order.
  shuffleArray() {
    for (let i = this.pieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.pieces[i].number, this.pieces[j].number] = [
        this.pieces[j].number,
        this.pieces[i].number,
      ];
    }
  } //end of shuffleArray() method.

  //method for starting the timer
  startTimer() {
    //unsubscribe to any existing timer to avoid multiple timers running.
    this.timerSubscription.unsubscribe();

    //start a new timer.
    this.timerValueSec = 0; //reset timer value.
    const source = timer(1000, 1000); //start after 1 second, emit every 1 second.
    this.timerSubscription = source.subscribe((val) => {
      this.timerValueSec = val + 1; //update timer value.
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

} // end class.
