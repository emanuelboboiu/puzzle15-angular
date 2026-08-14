import {
  ChangeDetectionStrategy,
  Component,
  AfterViewInit,
  ElementRef,
  HostListener,
  ViewChild,
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
export class RatingComponent implements AfterViewInit {
  @ViewChild('rateButton') rateButton?: ElementRef<HTMLButtonElement>;
  readonly closed = output<void>();
  readonly rated = output<void>();
  status = '';

  constructor(
    public settings: SettingsService,
    public ratingService: RatingService,
  ) {}

  ngAfterViewInit(): void {
    if (this.settings.os === 1) {
      setTimeout(() => this.rateButton?.nativeElement.focus());
    }
  }

  @HostListener('document:keydown.escape')
  close(): void {
    this.closed.emit();
  }

  async rateGame(): Promise<void> {
    this.status = '';
    const opened = await this.ratingService.openStore(this.settings.os);

    if (opened) {
      this.rated.emit();
    } else {
      this.status = this.settings.getString('MSG_RATE_FAILED');
    }
  }
}
