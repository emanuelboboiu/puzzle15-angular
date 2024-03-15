import { Component, NgModule } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RequestsService } from './requests.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgIf, NgFor],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = '15 Puzzle';
  currSection: number = 0; // 0 means main page, 1 means the game zone etc.
  boardSize: number = 4;

  constructor() {

  } // end constructor.

  // A method used to go to main page.
  goToMain(): void {
    this.currSection = 0;
  } // end goToMain() method.

  // A method used to go to game board zone.
  goToGame(size: number): void {
    this.boardSize = size; // the size comes from the html button clickedf.
    this.currSection = 1;

  } // end goToGame() method.

} // end class.
