import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniStackComponent } from './stack.component';

describe('UniStackComponent', () => {
  let fixture: ComponentFixture<UniStackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniStackComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniStackComponent);
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
