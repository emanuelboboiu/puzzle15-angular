import { Injectable } from '@angular/core';
import { AppLauncher } from '@capacitor/app-launcher';

@Injectable({
  providedIn: 'root',
})
export class RatingService {
  private readonly hasRatedKey = 'hasRatedPuzzle15';
  private readonly googlePlayUrl =
    'https://play.google.com/store/apps/details?id=ro.pontes.puzzlex';
  private readonly appStoreUrl =
    'https://apps.apple.com/app/id6480232251?action=write-review';

  getStoreName(os: number): 'Google Play' | 'App Store' {
    return os === 1 ? 'App Store' : 'Google Play';
  }

  hasRated(): boolean {
    return localStorage.getItem(this.hasRatedKey) === 'true';
  }

  markAsRated(): void {
    localStorage.setItem(this.hasRatedKey, 'true');
  }

  async openStore(os: number): Promise<boolean> {
    const url = os === 1 ? this.appStoreUrl : this.googlePlayUrl;

    try {
      const result = await AppLauncher.openUrl({ url });
      return result.completed;
    } catch {
      return false;
    }
  }
}
