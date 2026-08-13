import { Injectable } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { Share } from '@capacitor/share';

export type ShareResult = 'shared' | 'copied' | 'failed' | 'cancelled';

@Injectable({
  providedIn: 'root',
})
export class ShareService {
  private readonly gameUrl = 'https://static.pontes.ro/puzzlex/';

  constructor(private clipboard: Clipboard) {}

  async shareGame(text: string, dialogTitle: string): Promise<ShareResult> {
    try {
      const { value: canShare } = await Share.canShare();

      if (!canShare) {
        return this.copyGameUrl();
      }

      await Share.share({
        title: '15 Puzzle',
        text,
        url: this.gameUrl,
        dialogTitle,
      });
      return 'shared';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return 'cancelled';
      }

      return this.copyGameUrl();
    }
  }

  private copyGameUrl(): ShareResult {
    return this.clipboard.copy(this.gameUrl) ? 'copied' : 'failed';
  }
}
