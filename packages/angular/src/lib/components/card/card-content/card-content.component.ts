import { Component } from '@angular/core';
import { BaseComponent, COMPONENT_NAME } from '../../base/base.component';

@Component({
  selector: 'uni-card-content, CardContent',
  standalone: true,
  imports: [],
  templateUrl: './card-content.component.html',
  providers: [{ provide: COMPONENT_NAME, useValue: 'cardContent' }],
  styleUrls: ['./card-content.component.scss'],
})
export class UniCardContentComponent extends BaseComponent {}
