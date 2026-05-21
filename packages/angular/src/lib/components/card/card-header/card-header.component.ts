import { NgClass } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { css } from '@emotion/css';
import { BaseComponent, COMPONENT_NAME } from '../../base/base.component';
import { UniTextComponent } from '../../text';
import { UniCardComponent } from '../card.component';
import type { Typeface } from '@uni-design-system/uni-core';

@Component({
  selector: 'uni-card-header, CardHeader',
  standalone: true,
  imports: [UniTextComponent, NgClass],
  templateUrl: './card-header.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'cardHeader' }],
  styleUrls: ['./card-header.component.scss'],
})
export class UniCardHeaderComponent extends BaseComponent {
  private card = inject(UniCardComponent, {
    optional: true,
    host: true,
    skipSelf: true,
  });

  title = input<string>('');
  titleTextRole = input<Typeface>('title-large');

  constructor() {
    super();

    // this.variant = this.card?.variant;
  }

  className = css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  });
}
