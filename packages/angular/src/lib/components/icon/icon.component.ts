import { Component, HostBinding, inject, input, Input } from '@angular/core';
import { css } from '@emotion/css';

import { ThemeService } from '../../theming/theme.service';
import type { ColorToken, Icons } from '@uni-design-system/uni-core';

@Component({
  selector: 'uni-icon, Icon',
  standalone: true,
  imports: [],
  template: '',
  styleUrls: ['./icon.component.scss'],
})
export class UniIconComponent {
  private themeService = inject(ThemeService);

  color = input<ColorToken>();

  @HostBinding('style.-webkit-mask-image')
  protected _path!: string;

  @HostBinding('class') get className() {
    return css([{ ...this.themeService.color(this.color()) }]);
  }

  @Input()
  public set name(iconName: keyof Icons) {
    const theme = this.themeService.theme();
    this._path = `url("${theme.icons[iconName]}")`;
  }
}
