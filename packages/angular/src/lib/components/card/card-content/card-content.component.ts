import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseComponent, COMPONENT_NAME } from '../../base/base.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'uni-card-content, CardContent',
  imports: [],
  templateUrl: './card-content.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'cardContent' }],
  styleUrls: ['./card-content.component.scss'],
})
export class UniCardContentComponent extends BaseComponent {}
