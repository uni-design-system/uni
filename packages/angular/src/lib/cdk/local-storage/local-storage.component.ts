import { Component, inject } from '@angular/core';
import { LocalStorageService } from '../../../lib/cdk';
import {
  UniButtonComponent,
  UniRowComponent,
  UniStackComponent,
  UniTextComponent,
} from '../../components';

@Component({
  selector: 'uni-local-storage-story-component, local-storage-story-component',
  template: `<div stack-layout gap="md">
    <div row-layout gap="lg">
      <button text-button (click)="setItem()" symbolLeft="save">Set Item</button>
      <button text-button (click)="getItem()" symbolLeft="get_app">Get Item</button>
      <button text-button (click)="removeItem()" symbolLeft="delete">Remove Item</button>
      <button text-button (click)="clearStorage()" symbolLeft="clear_all">Clear All</button>
    </div>

    <div row-layout gap="lg">
      <button text-button (click)="getAllKeys()" symbolLeft="list">Get All Keys</button>
      <button text-button (click)="getStorageSize()" symbolLeft="storage">Get Storage Size</button>
      <button text-button (click)="checkKey()" symbolLeft="search">Check Key Exists</button>
    </div>

    <div>
      <Text display="block">Storage Contents:</Text>
      <textarea rows="8" cols="80" readonly>{{ displayContent }}</textarea>
    </div>
  </div>`,
  standalone: true,
  imports: [UniButtonComponent, UniRowComponent, UniTextComponent, UniStackComponent],
})
export class LocalStorageStoryComponent {
  private localStorage = inject(LocalStorageService);

  displayContent = 'Click buttons to interact with localStorage...';

  setItem() {
    const testData = {
      name: 'Test User',
      timestamp: new Date().toISOString(),
      preferences: { theme: 'dark', language: 'en' },
    };

    const success = this.localStorage.setItem('demo-object', testData);
    const stringSuccess = this.localStorage.setItem('demo-string', 'Hello, LocalStorage!');

    this.updateDisplay();
    this.displayContent =
      `Set operations: Object=${success}, String=${stringSuccess}\n\n` + this.displayContent;
  }

  getItem() {
    const objectData = this.localStorage.getItem<never>('demo-object');
    const stringData = this.localStorage.getItem<string>('demo-string');
    const nonExistent = this.localStorage.getItem('non-existent-key');

    this.displayContent = `Retrieved items:\nObject: ${JSON.stringify(objectData, null, 2)}\nString: "${stringData}"\nNon-existent: ${nonExistent}`;
  }

  removeItem() {
    const success = this.localStorage.removeItem('demo-string');
    this.updateDisplay();
    this.displayContent = `Removed 'demo-string': ${success}\n\n` + this.displayContent;
  }

  clearStorage() {
    const success = this.localStorage.clear();
    this.updateDisplay();
    this.displayContent = `Cleared all localStorage: ${success}\n\n` + this.displayContent;
  }

  getAllKeys() {
    const keys = this.localStorage.getAllKeys();
    this.displayContent = `All localStorage keys: [${keys.join(', ')}]\nTotal keys: ${keys.length}`;
  }

  getStorageSize() {
    const size = this.localStorage.getSize();
    this.displayContent = `LocalStorage size: ${size} characters (${Math.round((size / 1024) * 100) / 100} KB)`;
  }

  checkKey() {
    const hasObject = this.localStorage.hasKey('demo-object');
    const hasString = this.localStorage.hasKey('demo-string');
    const hasNonExistent = this.localStorage.hasKey('non-existent-key');

    this.displayContent = `Key existence check:\n- 'demo-object': ${hasObject}\n- 'demo-string': ${hasString}\n- 'non-existent-key': ${hasNonExistent}`;
  }

  private updateDisplay() {
    const keys = this.localStorage.getAllKeys();
    const size = this.localStorage.getSize();

    this.displayContent = `Current localStorage state:\nKeys: [${keys.join(', ')}]\nSize: ${size} characters`;
  }
}
