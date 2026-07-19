import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

// Zoneless test environment: zone.js is intentionally absent — Angular's
// TestBed runs with zoneless change detection, matching how this library
// is used in applications.
getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

// --- jsdom gaps -----------------------------------------------------------
// jsdom does not implement the Popover API or <dialog> show/showModal.
// Provide minimal behavioral stubs so components using native primitives
// stay unit-testable; real interaction coverage lives in Storybook.

if (!HTMLElement.prototype.showPopover) {
  HTMLElement.prototype.showPopover = function () {
    this.dispatchEvent(
      Object.assign(new Event('toggle'), { newState: 'open', oldState: 'closed' })
    );
  };
  HTMLElement.prototype.hidePopover = function () {
    this.dispatchEvent(
      Object.assign(new Event('toggle'), { newState: 'closed', oldState: 'open' })
    );
  };
}

if (typeof HTMLDialogElement !== 'undefined' && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.show = function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
}
