import {
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';
import { SettingsService } from '../settings.service';
import { PlayerService } from '../player.service';
import { ShareService } from '../share.service';

@Component({
  selector: 'app-about',
  imports: [],
  templateUrl: './about.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './about.component.css',
})
export class AboutComponent {
  shareStatus = '';

  constructor(
    public settings: SettingsService,
    private player: PlayerService,
    private shareService: ShareService
  ) {}

  async shareGame(): Promise<void> {
    this.shareStatus = '';
    const result = await this.shareService.shareGame(
      this.settings.getString('MSG_SHARE_TEXT'),
      this.settings.getString('MSG_SHARE_DIALOG_TITLE')
    );

    if (result === 'copied') {
      this.shareStatus = this.settings.getString('MSG_COPY_SUCCESS');
      this.player.play('move');
    } else if (result === 'failed') {
      this.shareStatus = this.settings.getString('MSG_COPY_FAILED');
      this.player.play('blocked');
    }
  }
} // end AboutComponent class.
