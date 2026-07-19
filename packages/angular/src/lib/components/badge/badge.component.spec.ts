import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniBadgeComponent } from './badge.component';

describe('UniBadgeComponent', () => {
  let fixture: ComponentFixture<UniBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniBadgeComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniBadgeComponent);
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
