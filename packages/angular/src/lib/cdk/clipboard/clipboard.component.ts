import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  UniBadgeComponent,
  UniRowDirective,
  UniStackDirective,
  UniButtonComponent,
} from '../../components';
import { copyToClipboard, type ClipboardContent, type ClipboardCopyResult } from './clipboard';
import type { Variant } from '@uni-design-system/uni-core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-clipboard-story-component, clipboard-story-component',
  template: `
    <div stack-layout gap="sm">
      <div row-layout gap="sm" alignItems="center">
        <button uni-text-button (click)="copy(text)">Copy text</button>
        <button uni-text-button (click)="copy(rich)">Copy rich text</button>
        @if (result(); as result) {
          <div uni-badge [color]="colorTokens[result]">{{ result }}</div>
        }
      </div>
    </div>
  `,
  imports: [UniStackDirective, UniRowDirective, UniButtonComponent, UniBadgeComponent],
})
export class ClipboardStoryComponent {
  protected readonly text = 'Copied with the Uni CDK';
  protected readonly rich: ClipboardContent = {
    'text/plain': this.text,
    'text/html': '<strong>Copied</strong> with the <em>Uni CDK</em>',
  };

  protected readonly result = signal<ClipboardCopyResult | null>(null);

  protected readonly colorTokens: Record<ClipboardCopyResult, Variant> = {
    copied: 'secondary',
    denied: 'warn',
    unsupported: 'disabled',
    failed: 'warn',
  };

  protected async copy(content: ClipboardContent): Promise<void> {
    this.result.set(await copyToClipboard(content));
  }
}
