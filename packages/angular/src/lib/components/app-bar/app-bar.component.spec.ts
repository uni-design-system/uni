import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniAppBarComponent } from './app-bar.component';

@Component({
  imports: [UniAppBarComponent],
  template: `
    <uni-app-bar title="Console">
      <button leading id="menu">☰</button>
      <button trailing id="account">Account</button>
    </uni-app-bar>
  `,
})
class Host {}

describe('UniAppBarComponent', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  it('renders the title and projects leading/trailing slots in order', () => {
    const bar = (fixture.nativeElement as HTMLElement).querySelector('uni-app-bar')!;
    const title = bar.querySelector('.uni-app-bar-title')!;
    expect(title.textContent).toBe('Console');
    const order = Array.from(bar.children).map((el) => el.id || el.className.split(' ')[0] || el.tagName);
    expect(order.indexOf('menu')).toBeLessThan(order.indexOf('uni-app-bar-title'));
    // Trailing content lands after the flexible spacer, pushed to the edge.
    expect(order.indexOf('uni-app-bar-spacer')).toBeLessThan(order.indexOf('account'));
  });
});
