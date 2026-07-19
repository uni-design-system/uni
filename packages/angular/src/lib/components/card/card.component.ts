import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseComponent, COMPONENT_NAME } from '../base/base.component';
import type { UniCardOptions } from './card.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-card, Card',
  imports: [],
  templateUrl: './card.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'card' }],
})
export class UniCardComponent extends BaseComponent<UniCardOptions> {}
