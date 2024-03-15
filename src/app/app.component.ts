import { NgFor, NgIf } from '@angular/common';
import { Component, NgModule } from '@angular/core';

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

  constructor() {

  } // end constructor.

  // A method used to go to game board zone.
  goToGame(): void {
    this.currSection = 1;
  } // end goToGame() method.

  // A method used to go to main page.
  goToMain(): void {
    this.currSection = 0;
  } // end goToMain() method.

} // end class.
