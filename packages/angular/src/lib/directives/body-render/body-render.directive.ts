import { Directive, ElementRef, inject, OnInit, Renderer2 } from '@angular/core';

@Directive({
  standalone: true,
  selector: '[uniBodyRender]',
})
export class BodyRenderDirective implements OnInit {
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  ngOnInit() {
    const element = this.el.nativeElement;
    this.renderer.appendChild(document.body, element);
  }
}
