import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniWrapComponent } from './wrap.component';

describe('UniWrapComponent', () => {
  let fixture: ComponentFixture<UniWrapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniWrapComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniWrapComponent);
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
