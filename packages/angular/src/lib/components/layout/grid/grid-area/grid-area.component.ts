import { Component, HostBinding, Input } from '@angular/core';
import { css } from '@emotion/css';

@Component({
  selector: 'GridArea',
  standalone: true,
  imports: [],
  template: `<ng-content></ng-content>`,
})
export class UniGridAreaComponent {
  @Input() area!: string;

  @HostBinding('class') get className() {
    return css([{ gridArea: this.area }]);
  }
}
