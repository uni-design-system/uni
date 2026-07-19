import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BaseComponent, COMPONENT_NAME } from './base.component';

describe('BaseComponent', () => {
  let fixture: ComponentFixture<BaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaseComponent],
      providers: [{ provide: COMPONENT_NAME, useValue: 'button' }],
    }).compileComponents();
    fixture = TestBed.createComponent(BaseComponent);
    fixture.detectChanges();
  });

  it('creates with theme-derived options', () => {
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
    expect(component.componentOptions()).toBeDefined();
    expect(component.componentTheme()).toBeDefined();
  });
});
