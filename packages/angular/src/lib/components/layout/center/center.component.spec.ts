import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniCenterComponent } from './center.component';

describe('UniCenterComponent', () => {
  let fixture: ComponentFixture<UniCenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniCenterComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniCenterComponent);
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
