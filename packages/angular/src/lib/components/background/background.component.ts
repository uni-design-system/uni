import { Component, HostBinding, inject, input } from '@angular/core';
import { css } from '@emotion/css';
import { ThemeService } from '../../theming';

export type ImagePosition = 'top' | 'bottom' | 'left' | 'right' | 'center' | string;

@Component({
  selector: 'uni-background, Background',
  standalone: true,
  imports: [],
  template: `<ng-content></ng-content>`,
})
export class UniBackgroundComponent {
  theme = inject(ThemeService);

  image = input<string>();
  imagePosition = input<ImagePosition>();
  imageSize = input<'cover' | 'contain' | number | string>();
  height = input<number | string>('100%');
  width = input<number | string>();

  @HostBinding('class') get className() {
    return css([
      {
        backgroundRepeat: 'no-repeat',
        display: 'block',
        ...this.theme.backgroundImage(this.image()),
      },
      this.theme.style('backgroundPosition', this.imagePosition()),
      this.theme.style('backgroundSize', this.imageSize()),
      this.theme.style('height', this.height()),
      this.theme.style('width', this.width()),
    ]);
  }
}
