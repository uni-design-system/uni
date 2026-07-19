import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniRowComponent } from './row.component';

describe('UniRowComponent', () => {
  let fixture: ComponentFixture<UniRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniRowComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniRowComponent);
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
