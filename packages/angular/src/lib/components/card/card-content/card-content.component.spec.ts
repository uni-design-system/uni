import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniCardContentComponent } from './card-content.component';

describe('UniCardContentComponent', () => {
  let fixture: ComponentFixture<UniCardContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniCardContentComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniCardContentComponent);
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
