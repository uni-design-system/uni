import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniDialogHeaderComponent } from './dialog-header.component';

describe('UniDialogHeaderComponent', () => {
  let fixture: ComponentFixture<UniDialogHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UniDialogHeaderComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(UniDialogHeaderComponent);
    fixture.detectChanges();
  });

  it('creates (dialog parent is optional)', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
