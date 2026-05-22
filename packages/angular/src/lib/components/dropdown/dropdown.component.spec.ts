import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OuiDropdownComponent } from './dropdown.component';

describe('DropdownComponent', () => {
  let component: OuiDropdownComponent;
  let fixture: ComponentFixture<OuiDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OuiDropdownComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OuiDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
