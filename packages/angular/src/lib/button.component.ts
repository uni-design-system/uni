import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common'; // Still useful for pipes/directives

@Component({
  selector: 'uni-button',
  standalone: true, // Optional but explicit
  imports: [CommonModule],
  template: `
    <button [style.background-color]="bgColor" [style.color]="textColor">
      {{ label }}
    </button>
  `,
  styles: [`
    button { padding: 12px 24px; border-radius: 4px; border: none; cursor: pointer; }
  `]
})
export class UniButtonComponent {
  @Input() label: string = 'Button';
  bgColor = "#000000";
  textColor = "#fff";
}
