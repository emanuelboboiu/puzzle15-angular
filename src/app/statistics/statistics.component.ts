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
  | 'personal'
  | 'startedByLanguage'
  | 'solvedByLanguage'
  | 'startedByPlatform'
  | 'solvedByPlatform';

interface LanguageStatistic {
  code: string;
  name: string;
  count: number;
}

interface LanguageStatisticsSection {
  id: StatisticsSectionId;
  titleKey: string;
  statistics: LanguageStatistic[];
}

interface PlatformStatistic {
  os: number;
  name: string;
  count: number;
}

interface PlatformStatisticsSection {
  id: StatisticsSectionId;
  titleKey: string;
  statistics: PlatformStatistic[];
}

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
  openSection: StatisticsSectionId | null = null;

  allTime = this.createEmptyPeriod();
  last28Days = this.createEmptyPeriod(false);
  last7Days = this.createEmptyPeriod(false);
  last24Hours = this.createEmptyPeriod(false);
  personal = this.createEmptyPeriod();
  languageStatisticsAvailable = false;
  startedGamesByLanguage: LanguageStatistic[] = [];
  solvedGamesByLanguage: LanguageStatistic[] = [];
  platformStatisticsAvailable = false;
  startedGamesByPlatform: PlatformStatistic[] = [];
  solvedGamesByPlatform: PlatformStatistic[] = [];

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
        id: 'personal',
        titleKey: 'TITLE_PERSONAL_STATISTICS',
        emptyMessageKey: 'MSG_PERSONAL_STATS_NOT_AVAILABLE',
        statistics: this.personal,
      },
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
    ];
  }

  get languageSections(): LanguageStatisticsSection[] {
    return [
      {
        id: 'startedByLanguage',
        titleKey: 'TITLE_STARTED_BY_LANGUAGE',
        statistics: this.startedGamesByLanguage,
      },
      {
        id: 'solvedByLanguage',
        titleKey: 'TITLE_SOLVED_BY_LANGUAGE',
        statistics: this.solvedGamesByLanguage,
      },
    ];
  }

  get platformSections(): PlatformStatisticsSection[] {
    return [
      {
        id: 'startedByPlatform',
        titleKey: 'TITLE_STARTED_BY_PLATFORM',
        statistics: this.startedGamesByPlatform,
      },
      {
        id: 'solvedByPlatform',
        titleKey: 'TITLE_SOLVED_BY_PLATFORM',
        statistics: this.solvedGamesByPlatform,
      },
    ];
  }

  toggleSection(
    event: MouseEvent,
    sectionId: StatisticsSectionId,
  ): void {
    event.preventDefault();
    this.player.play('click');
    this.openSection = this.openSection === sectionId ? null : sectionId;
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
        if (json.startedGamesByLanguage && json.solvedGamesByLanguage) {
          this.languageStatisticsAvailable = true;
          this.startedGamesByLanguage = this.mapLanguageStatistics(
            json.startedGamesByLanguage,
          );
          this.solvedGamesByLanguage = this.mapLanguageStatistics(
            json.solvedGamesByLanguage,
          );
        }
        if (
          json.startedGamesByPlatform !== undefined &&
          json.solvedGamesByPlatform !== undefined
        ) {
          this.platformStatisticsAvailable = true;
          this.startedGamesByPlatform = this.mapPlatformStatistics(
            json.startedGamesByPlatform,
          );
          this.solvedGamesByPlatform = this.mapPlatformStatistics(
            json.solvedGamesByPlatform,
          );
        }
      });
  }

  private mapLanguageStatistics(
    values: Record<string, string | number>,
  ): LanguageStatistic[] {
    const displayNames = new Intl.DisplayNames([this.settings.language], {
      type: 'language',
    });

    return Object.entries(values)
      .map(([code, count]) => ({
        code,
        name: displayNames.of(code) || code.toUpperCase(),
        count: Number(count),
      }))
      .filter((item) => Number.isFinite(item.count) && item.count > 0)
      .sort(
        (first, second) =>
          second.count - first.count ||
          first.name.localeCompare(second.name, this.settings.language),
      );
  }

  private mapPlatformStatistics(values: any[]): PlatformStatistic[] {
    return (values || [])
      .map((item) => {
        const os = Number(item.os);
        return {
          os,
          name:
            this.settings.deviceNames[os] ||
            `${this.settings.getString('LABEL_UNKNOWN_PLATFORM')} ${os}`,
          count: Number(item.count),
        };
      })
      .filter(
        (item) =>
          Number.isInteger(item.os) &&
          Number.isFinite(item.count) &&
          item.count > 0,
      )
      .sort(
        (first, second) =>
          second.count - first.count || first.name.localeCompare(second.name),
      );
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
