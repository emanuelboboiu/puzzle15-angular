import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  output,
} from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { SettingsService } from '../settings.service';
import { RatingService } from '../rating.service';

@Component({
  selector: 'app-rating',
  imports: [A11yModule],
  templateUrl: './rating.component.html',
  styleUrl: './rating.component.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class RatingComponent {
  readonly closed = output<void>();
  status = '';

  constructor(
    public settings: SettingsService,
    public ratingService: RatingService,
  ) {}

  @HostListener('document:keydown.escape')
  close(): void {
    this.closed.emit();
  }

  async rateGame(): Promise<void> {
    this.status = '';
    const opened = await this.ratingService.openStore(this.settings.os);

    if (opened) {
      this.close();
    } else {
      this.status = this.settings.getString('MSG_RATE_FAILED');
    }
  }
}
