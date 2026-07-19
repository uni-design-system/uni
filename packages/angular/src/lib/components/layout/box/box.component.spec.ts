import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniBoxComponent } from './box.component';

describe('UniBoxComponent', () => {
  let fixture: ComponentFixture<UniBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniBoxComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniBoxComponent);
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
