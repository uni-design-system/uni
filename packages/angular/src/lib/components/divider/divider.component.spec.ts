import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniDividerComponent } from './divider.component';

describe('UniDividerComponent', () => {
  let fixture: ComponentFixture<UniDividerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniDividerComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniDividerComponent);
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
