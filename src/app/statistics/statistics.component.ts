import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
} from '@angular/core';
import { KeyValuePipe } from '@angular/common';
import { SettingsService } from '../settings.service';
import { StatisticsService } from '../statistics.service';
import { RequestsService } from '../requests.service';
import { PlayerService } from '../player.service';

type StatisticsSectionId =
  | 'allTime'
  | 'last28Days'
  | 'last7Days'
  | 'last24Hours'
  | 'personal';

interface PeriodStatistics {
  available: boolean;
  hasSolvedGames: boolean;
  record: string;
  recordDate: string;
  startedGames: Record<string, string | number>;
  totalStarted: string;
  finishedGames: Record<string, string | number>;
  totalSolved: string;
  averageDuration: string;
  averageMoves: string;
}

interface StatisticsSection {
  id: StatisticsSectionId;
  titleKey: string;
  emptyMessageKey: string;
  statistics: PeriodStatistics;
}

@Component({
  selector: 'app-statistics',
  imports: [KeyValuePipe],
  templateUrl: './statistics.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './statistics.component.css',
})
export class StatisticsComponent implements OnInit {
  private readonly apiFileName = 'get_stats.php';

  allTime = this.createEmptyPeriod();
  last28Days = this.createEmptyPeriod(false);
  last7Days = this.createEmptyPeriod(false);
  last24Hours = this.createEmptyPeriod(false);
  personal = this.createEmptyPeriod();

  constructor(
    public settings: SettingsService,
    private statistics: StatisticsService,
    private requests: RequestsService,
    private player: PlayerService,
  ) {}

  ngOnInit(): void {
    this.loadGlobalStatistics();
    this.loadPersonalStatistics();
  }

  get sections(): StatisticsSection[] {
    return [
      {
        id: 'allTime',
        titleKey: 'TITLE_ALL_TIME_STATISTICS',
        emptyMessageKey: 'MSG_NO_SOLVED_ALL_TIME',
        statistics: this.allTime,
      },
      {
        id: 'last28Days',
        titleKey: 'TITLE_LAST_28_DAYS_STATISTICS',
        emptyMessageKey: 'MSG_NO_SOLVED_LAST_28_DAYS',
        statistics: this.last28Days,
      },
      {
        id: 'last7Days',
        titleKey: 'TITLE_LAST_7_DAYS_STATISTICS',
        emptyMessageKey: 'MSG_NO_SOLVED_LAST_7_DAYS',
        statistics: this.last7Days,
      },
      {
        id: 'last24Hours',
        titleKey: 'TITLE_LAST_24_HOURS_STATISTICS',
        emptyMessageKey: 'MSG_NO_SOLVED_LAST_24_HOURS',
        statistics: this.last24Hours,
      },
      {
        id: 'personal',
        titleKey: 'TITLE_PERSONAL_STATISTICS',
        emptyMessageKey: 'MSG_PERSONAL_STATS_NOT_AVAILABLE',
        statistics: this.personal,
      },
    ];
  }

  playSectionClick(): void {
    this.player.play('click');
  }

  private loadGlobalStatistics(): void {
    this.requests
      .getDataGet(this.apiFileName, '?act=getStats')
      .subscribe((json) => {
        this.allTime = this.mapApiPeriod(
          json.allTime || {
            record: json.generalRecord,
            recordDate: json.generalRecordDate,
            startedGames: json.startedGames,
            finishedGames: json.finishedGames,
            averageDuration: json.generalAverageDuration,
            averageMoves: json.generalAverageMoves,
          },
        );

        if (json.last28Days) {
          this.last28Days = this.mapApiPeriod(json.last28Days);
        }
        if (json.last7Days) {
          this.last7Days = this.mapApiPeriod(json.last7Days);
        }
        if (json.last24Hours) {
          this.last24Hours = this.mapApiPeriod(json.last24Hours);
        }
      });
  }

  private mapApiPeriod(period: any): PeriodStatistics {
    const startedGames = period.startedGames || { 3: 0, 4: 0, 5: 0 };
    const finishedGames = period.finishedGames || { 3: 0, 4: 0, 5: 0 };
    const totalSolved = this.calculateTotalSumOfValues(finishedGames);
    const hasSolvedGames = totalSolved > 0;

    return {
      available: true,
      hasSolvedGames,
      record: hasSolvedGames ? String(period.record ?? 0) : '0',
      recordDate:
        hasSolvedGames && period.recordDate
          ? this.settings.getFriendlyDate(new Date(period.recordDate))
          : '',
      startedGames,
      totalStarted: String(this.calculateTotalSumOfValues(startedGames)),
      finishedGames,
      totalSolved: String(totalSolved),
      averageDuration: hasSolvedGames
        ? this.secondsToMinutesSeconds(Number(period.averageDuration ?? 0))
        : '00:00',
      averageMoves: hasSolvedGames
        ? String(period.averageMoves ?? 0)
        : '0',
    };
  }

  private loadPersonalStatistics(): void {
    const totalMoves = this.settings.getNumberSetting(
      this.statistics.lsTotalMovesKey,
    );
    if (totalMoves <= 0) {
      return;
    }

    const startedGames = this.statistics.getStartedGames();
    const finishedGames = this.statistics.getFinishedGames();
    const totalSolved = this.calculateTotalSumOfValues(finishedGames);
    const totalDuration = this.settings.getNumberSetting(
      this.statistics.lsTotalDurationKey,
    );
    const savedRecordDate = this.settings.lsExists(
      this.statistics.lsRecordDateKey,
    )
      ? this.settings.getStringSetting(this.statistics.lsRecordDateKey)
      : '';

    this.personal = {
      available: true,
      hasSolvedGames: totalSolved > 0,
      record: this.settings.getStringSetting(this.statistics.lsRecordKey),
      recordDate: savedRecordDate
        ? this.settings.getFriendlyDate(new Date(savedRecordDate))
        : '',
      startedGames,
      totalStarted: String(this.calculateTotalSumOfValues(startedGames)),
      finishedGames,
      totalSolved: String(totalSolved),
      averageDuration:
        totalSolved > 0
          ? this.secondsToMinutesSeconds(Math.round(totalDuration / totalSolved))
          : '00:00',
      averageMoves:
        totalSolved > 0 ? String(Math.round(totalMoves / totalSolved)) : '0',
    };
  }

  private createEmptyPeriod(available = true): PeriodStatistics {
    return {
      available,
      hasSolvedGames: false,
      record: '0',
      recordDate: '',
      startedGames: { 3: 0, 4: 0, 5: 0 },
      totalStarted: '0',
      finishedGames: { 3: 0, 4: 0, 5: 0 },
      totalSolved: '0',
      averageDuration: '00:00',
      averageMoves: '0',
    };
  }

  private calculateTotalSumOfValues(values: Record<string, unknown>): number {
    return Object.values(values).reduce<number>(
      (total, value) => total + Number(value),
      0,
    );
  }

  private secondsToMinutesSeconds(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(
      remainingSeconds,
    ).padStart(2, '0')}`;
  }
}
