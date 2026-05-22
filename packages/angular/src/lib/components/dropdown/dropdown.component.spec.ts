import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UniDropdownComponent } from './dropdown.component';

describe('DropdownComponent', () => {
  let component: UniDropdownComponent;
  let fixture: ComponentFixture<UniDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UniDropdownComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UniDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
