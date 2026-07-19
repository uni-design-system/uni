import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniIconComponent } from './icon.component';

describe('UniIconComponent', () => {
  let fixture: ComponentFixture<UniIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniIconComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniIconComponent);
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
