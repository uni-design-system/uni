import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniAvatarComponent } from './avatar.component';
import { UniAvatarGroupComponent } from './avatar-group.component';

describe('UniAvatarComponent', () => {
  let fixture: ComponentFixture<UniAvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UniAvatarComponent] }).compileComponents();
    fixture = TestBed.createComponent(UniAvatarComponent);
  });

  it('derives two-letter initials from first and last name', () => {
    fixture.componentRef.setInput('name', 'Grace Murray Hopper');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toBe('GH');
  });

  it('single names yield a single initial', () => {
    fixture.componentRef.setInput('name', 'Plato');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toBe('P');
  });

  it('labels itself for screen readers from the name', () => {
    fixture.componentRef.setInput('name', 'Grace Hopper');
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute('role')).toBe('img');
    expect(host.getAttribute('aria-label')).toBe('Grace Hopper');
  });

  it('is aria-hidden when purely decorative (no name or text)', () => {
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).getAttribute('aria-hidden')).toBe('true');
  });

  it('prefers the image, then falls back to initials when it errors', () => {
    fixture.componentRef.setInput('src', 'https://example.test/nope.png');
    fixture.componentRef.setInput('name', 'Grace Hopper');
    fixture.detectChanges();
    const img = (fixture.nativeElement as HTMLElement).querySelector('img')!;
    expect(img).not.toBeNull();
    expect(img.getAttribute('alt')).toBe('');

    img.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('img')).toBeNull();
    expect(fixture.nativeElement.textContent.trim()).toBe('GH');
  });

  it('renders verbatim text when provided', () => {
    fixture.componentRef.setInput('text', '+7');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toBe('+7');
  });
});

@Component({
  imports: [UniAvatarGroupComponent, UniAvatarComponent],
  template: `
    <uni-avatar-group [max]="2" size="md">
      <uni-avatar name="Ada Lovelace" />
      <uni-avatar name="Grace Hopper" />
      <uni-avatar name="Katherine Johnson" />
      <uni-avatar name="Annie Easley" />
    </uni-avatar-group>
  `,
})
class GroupHost {}

describe('UniAvatarGroupComponent', () => {
  let fixture: ComponentFixture<GroupHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [GroupHost] }).compileComponents();
    fixture = TestBed.createComponent(GroupHost);
    fixture.detectChanges();
  });

  it('renders a surplus chip counting the avatars beyond max', () => {
    const host = fixture.nativeElement as HTMLElement;
    const surplus = host.querySelector('uni-avatar.uni-surplus');
    expect(surplus).not.toBeNull();
    expect(surplus!.textContent!.trim()).toBe('+2');
  });

  it('exposes the stack as a group', () => {
    const group = (fixture.nativeElement as HTMLElement).querySelector('uni-avatar-group')!;
    expect(group.getAttribute('role')).toBe('group');
  });
});
