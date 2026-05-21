import { Component } from '@angular/core';
import { BaseComponent, COMPONENT_NAME } from '../base/base.component';
import type { UniCardOptions } from './card.model';

@Component({
  selector: 'uni-card, Card',
  standalone: true,
  imports: [],
  templateUrl: './card.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'card' }],
})
export class UniCardComponent extends BaseComponent<UniCardOptions> {}
