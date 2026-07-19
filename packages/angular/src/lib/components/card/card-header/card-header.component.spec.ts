import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniCardHeaderComponent } from './card-header.component';

describe('UniCardHeaderComponent', () => {
  let fixture: ComponentFixture<UniCardHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniCardHeaderComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniCardHeaderComponent);
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
