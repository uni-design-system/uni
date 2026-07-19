import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniCardComponent } from './card.component';

describe('UniCardComponent', () => {
  let fixture: ComponentFixture<UniCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniCardComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniCardComponent);
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
