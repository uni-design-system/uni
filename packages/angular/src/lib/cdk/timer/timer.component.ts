import { Component, signal } from '@angular/core';

import { useTimer } from './timer';
import {
  UniButtonComponent,
  UniRowComponent,
  UniStackComponent,
  UniTextComponent,
} from '../../components';

@Component({
  selector: 'oui-timer-story-component, timer-story-component',
  template: ` <div stack-layout gap="md">
    <div row-layout gap="lg">
      <button text-button (click)="startTimer()" symbolLeft="play_arrow">Start 10s Timer</button>
      <button text-button (click)="pauseTimer()" symbolLeft="pause">Pause</button>
      <button text-button (click)="resumeTimer()" symbolLeft="play_arrow">Resume</button>
      <button text-button (click)="stopTimer()" symbolLeft="stop">Stop</button>
    </div>

    <div row-layout gap="lg">
      <button text-button (click)="startCustomTimer()" symbolLeft="timer">Start 30s Timer</button>
      <button text-button (click)="startCountdown()" symbolLeft="schedule">
        Start 5s Countdown
      </button>
    </div>

    <div>
      <Text display="block">Timer Status:</Text>
      <div style="margin: 8px 0; padding: 12px; border: 1px solid #ccc; border-radius: 4px;">
        <div>
          <strong>Time Remaining:</strong> {{ timer.secondsRemaining() }}s ({{
            timer.msRemaining()
          }}ms)
        </div>
        <div><strong>Is Active:</strong> {{ timer.isActive() ? 'Yes' : 'No' }}</div>
        <div><strong>Is Paused:</strong> {{ timer.isPaused() ? 'Yes' : 'No' }}</div>
      </div>
    </div>

    <div>
      <Text display="block">Event Log:</Text>
      <textarea rows="8" cols="80" readonly>{{ eventLog() }}</textarea>
    </div>
  </div>`,
  standalone: true,
  imports: [UniButtonComponent, UniRowComponent, UniTextComponent, UniStackComponent],
})
export class TimerStoryComponent {
  timer = useTimer();
  eventLog = signal('Timer ready. Click buttons to interact...\n');

  private addLog(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.eventLog.update((current) => `[${timestamp}] ${message}\n${current}`);
  }

  startTimer() {
    this.addLog('Starting 10 second timer...');
    this.timer.start(10000, () => {
      this.addLog('✅ Timer completed!');
    });
  }

  startCustomTimer() {
    this.addLog('Starting 30 second timer...');
    this.timer.start(30000, () => {
      this.addLog('✅ 30 second timer completed!');
    });
  }

  startCountdown() {
    this.addLog('Starting 5 second countdown...');
    this.timer.start(5000, () => {
      this.addLog('🎉 Countdown finished!');
    });
  }

  pauseTimer() {
    if (this.timer.isActive() && !this.timer.isPaused()) {
      this.timer.pause();
      this.addLog('⏸️ Timer paused');
    } else {
      this.addLog('❌ Cannot pause - timer not active or already paused');
    }
  }

  resumeTimer() {
    if (this.timer.isActive() && this.timer.isPaused()) {
      this.timer.resume();
      this.addLog('▶️ Timer resumed');
    } else {
      this.addLog('❌ Cannot resume - timer not paused');
    }
  }

  stopTimer() {
    if (this.timer.isActive()) {
      this.timer.stop();
      this.addLog('⏹️ Timer stopped');
    } else {
      this.addLog('❌ No active timer to stop');
    }
  }
}
