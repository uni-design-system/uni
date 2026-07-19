import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniGridAreaComponent } from './grid-area.component';

describe('UniGridAreaComponent', () => {
  let fixture: ComponentFixture<UniGridAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniGridAreaComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniGridAreaComponent);
    fixture.componentRef.setInput('area', 'main');
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
