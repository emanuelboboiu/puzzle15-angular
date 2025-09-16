import { Injectable } from '@angular/core';

export interface SwipeEvent {
  direction: 'up' | 'down' | 'left' | 'right';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

@Injectable({
  providedIn: 'root'
})
export class GestureService {
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private minSwipeDistance: number = 50;
  private maxSwipeTime: number = 300;
  private touchStartTime: number = 0;

  constructor() { }

  onTouchStart(event: TouchEvent): void {
    const touch = event.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchStartTime = Date.now();
  }

  onTouchEnd(event: TouchEvent): SwipeEvent | null {
    const touch = event.changedTouches[0];
    const touchEndX = touch.clientX;
    const touchEndY = touch.clientY;
    const touchEndTime = Date.now();

    const deltaX = touchEndX - this.touchStartX;
    const deltaY = touchEndY - this.touchStartY;
    const swipeTime = touchEndTime - this.touchStartTime;

    // Check if swipe was fast enough and long enough
    if (swipeTime > this.maxSwipeTime) {
      return null;
    }

    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (Math.max(absDeltaX, absDeltaY) < this.minSwipeDistance) {
      return null;
    }

    // Determine swipe direction
    let direction: 'up' | 'down' | 'left' | 'right';

    if (absDeltaX > absDeltaY) {
      // Horizontal swipe
      direction = deltaX > 0 ? 'right' : 'left';
    } else {
      // Vertical swipe
      direction = deltaY > 0 ? 'down' : 'up';
    }

    return {
      direction,
      startX: this.touchStartX,
      startY: this.touchStartY,
      endX: touchEndX,
      endY: touchEndY
    };
  }
}