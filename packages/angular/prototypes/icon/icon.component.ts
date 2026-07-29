// components/icon/icon.component.ts
import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IconSlot, ThemeIconData } from '../../types/icon-manifest';
import { minimalistIconTheme } from '../../themes/minimalist-theme'; // Or injected via a Theme Service

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `
    <svg
      [attr.viewBox]="currentIconData?.viewBox || '0 0 24 24'"
      [style.width.px]="size"
      [style.height.px]="size"
      [innerHTML]="safeInnerHtml"
      class="design-system-icon"
      xmlns="http://w3.org"
    ></svg>
  `,
  styles: [
    `
      :host {
        display: inline-block;
        line-height: 0;
      }
      svg {
        fill: none; /* Allows stroke="currentColor" to do all the heavy lifting */
        display: block;
      }
    `,
  ],
})
export class IconComponent implements OnChanges {
  private sanitizer = inject(DomSanitizer);

  /** The semantic token key name */
  @Input({ required: true }) name!: IconSlot;

  /** Default sizing matches standard application grids */
  @Input() size: number = 24;

  // Active theme layout cache
  protected currentIconData?: ThemeIconData;
  protected safeInnerHtml?: SafeHtml;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['name']) {
      this.resolveIconData();
    }
  }

  private resolveIconData(): void {
    // Note: In production, switch this line to fetch from an injected 'ThemeService'
    const activeTheme = minimalistIconTheme;

    this.currentIconData = activeTheme.slots[this.name];

    if (this.currentIconData) {
      // By sanitizing the innerHtml string right here, we guarantee it safely binds to the UI
      this.safeInnerHtml = this.sanitizer.bypassSecurityTrustHtml(this.currentIconData.innerHtml);
    } else {
      console.warn(`Icon slot "${this.name}" was not found in theme: ${activeTheme.themeId}`);
      this.safeInnerHtml = '';
    }
  }
}
