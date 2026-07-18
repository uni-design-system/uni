import { Directive, output, signal } from '@angular/core';

@Directive({
  selector: '[uni-drag-n-drop], [dragAndDrop]',
  standalone: true,
  host: {
    '[style.opacity]': 'workspaceOpacity()',
    '(dragover)': 'onDragOver($event)',
    '(dragleave)': 'onDragLeave($event)',
    '(drop)': 'onDrop($event)',
  },
})
export class DragAndDropDirective {
  onFileDropped = output<FileList>();

  protected workspaceOpacity = signal('1');

  // Dragover listener, when files are dragged over our host element
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.workspaceOpacity.set('0.5');
  }

  // Dragleave listener, when files are dragged away from our host element
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.workspaceOpacity.set('1');
  }

  // Drop listener, when files are dropped on our host element
  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.workspaceOpacity.set('1');
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.onFileDropped.emit(files);
    }
  }
}
