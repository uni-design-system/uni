import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniGridComponent } from './grid.component';

describe('UniGridComponent', () => {
  let fixture: ComponentFixture<UniGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniGridComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniGridComponent);
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
