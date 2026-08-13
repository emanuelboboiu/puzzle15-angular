import {
  Component,
  NgModule,
  ChangeDetectionStrategy,
} from '@angular/core';
import { SettingsService } from '../settings.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { PlayerService } from '../player.service';

@Component({
  selector: 'app-about',
  imports: [],
  templateUrl: './about.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './about.component.css',
})
export class AboutComponent {
  copyStatus = '';

  constructor(
    public settings: SettingsService,
    private clipboard: Clipboard,
    private player: PlayerService
  ) {}

  copyDistributionURL() {
    const url = 'https://pontes.ro/puzzlex';
    const isCopied = this.clipboard.copy(url);
    if (isCopied) {
      this.copyStatus = this.settings.getString('MSG_COPY_SUCCESS');
      this.player.play('move');
    } else {
      this.copyStatus = this.settings.getString('MSG_COPY_FAILED');
      this.player.play('blocked');
    }
  } // end copyDistributionURL() method.
} // end AboutComponent class.
