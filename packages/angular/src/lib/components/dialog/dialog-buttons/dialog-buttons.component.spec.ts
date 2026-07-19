import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniDialogButtonsComponent } from './dialog-buttons.component';

describe('UniDialogButtonsComponent', () => {
  let fixture: ComponentFixture<UniDialogButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UniDialogButtonsComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(UniDialogButtonsComponent);
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
