import { Component, NgModule } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { RequestsService } from './requests.service';
import { piece } from './piece.type';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgIf, NgFor, NgClass],
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

  constructor() {} // end constructor.
  // this method creates the pieces.
  createBoard(): void {
    this.pieces = []; //here I initialize the array with an empty one.

    for (let i = 0; i < this.boardSize * this.boardSize; i++) {
      this.pieces.push({ number: i, x: 0, y: 0 }); //here I create new pieces with no x and y.
    }

    this.shuffleArray();

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

  //this method find the index of a piece in array by its number.
  findPieceIndexByNumber(number: number) {
    for (let i = 0; i < this.pieces.length; i++) {
      if (this.pieces[i].number === number) {
        return i;
      }
    }
    return -1;
  } //end of findPieceIndexByNumber() method.

  //this method tries and move the pieces.
  move(piece: piece) {
    //verify if the pieces are moving.
    if (this.disable == false) {
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
        const pieceIndex = this.findPieceIndexByNumber(piece.number);
        //some formulas to calculate the distance given the size of the board.
        this.distanceX =
          ((600 - (this.boardSize + 1) * 10) / this.boardSize + 10) * y;
        this.distanceY =
          ((600 - (this.boardSize + 1) * 10) / this.boardSize + 10) * x;
        this.distanceX = Math.round(this.distanceX);
        this.distanceY = Math.round(this.distanceY);

        console.log(this.distanceX, this.distanceY);
        //disable the buttons
        this.disable = true;
        //we actually move the pieces after 0.3s to wait for the transition to be done.
        setTimeout(() => {
          let aux = this.pieces[pieceIndex].number;
          this.pieces[pieceIndex].number = this.pieces[zeroIndex].number;
          this.pieces[zeroIndex].number = aux;
          this.disable = false;
        }, 300);
      }
    }
  } //end of move() method.

  // A method used to go to main page.
  goToMain(): void {
    this.currSection = 0;
  } // end goToMain() method.

  // A method used to go to game board zone.
  goToGame(size: number): void {
    this.boardSize = size; // the size comes from the html button clickedf.
    this.currSection = 1;
    this.createBoard();
  } // end goToGame() method.

  //a method to put pieces in a random order.
  private shuffleArray() {
    for (let i = this.pieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.pieces[i], this.pieces[j]] = [this.pieces[j], this.pieces[i]];
    }
  } //end of shuffleArray() method.
} // end class.
