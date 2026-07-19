import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  computed,
  effect,
  ElementRef,
  input,
  output,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { acceptableFile } from '../../cdk';
import { DragAndDropDirective } from '../../directives/drag-and-drop/drag-and-drop.directive';
import type { NullableSize, Radius, Variant } from '@uni-design-system/uni-core';
import { UniButtonComponent } from '../button/button.component';
import { UniBoxComponent, UniStackComponent } from '../layout';
import { UniTextComponent } from '../text/text.component';

@Component({
  selector: 'uni-file-drop-zone',
  imports: [
    DragAndDropDirective,
    UniBoxComponent,
    UniButtonComponent,
    UniStackComponent,
    UniTextComponent,
    NgTemplateOutlet,
  ],
  templateUrl: './file-drop-zone.component.html',
  standalone: true,
})
export class UniFileDropZoneComponent {
  selectedFile = signal<File | undefined>(undefined);
  selectedFileName = computed(() => this.selectedFile()?.name);
  attachmentState = signal<'upload' | undefined>(undefined);

  fileSelectorRef = viewChild.required<ElementRef<HTMLInputElement>>('fileSelector');

  get fileSelectorElement() {
    return this.fileSelectorRef().nativeElement;
  }

  height = input<number | string>();
  borderRadius = input<Radius>('md');
  border = input<Variant>('light');
  padding = input<NullableSize>('lg');
  useBrowseButton = input<boolean>(false);
  browseButtonText = input<string>('Browse for file');
  allowedFileExtensions = input<string[]>([]);
  label = input<string>();

  helpTemplate = input<TemplateRef<unknown> | null>(null);
  helpTemplateContext = input<unknown | null>(null);

  fileAttached = output<File | undefined>();
  fileRemoved = output();

  /**
   * The zone acts as the keyboard-reachable file picker only when no browse
   * button is rendered (nesting a button inside a button-role zone would be
   * invalid ARIA) and no file is attached yet.
   */
  zoneIsInteractive = computed(() => !this.useBrowseButton() && !this.attachmentState());

  sanitizedFileExtensions = computed(() =>
    this.allowedFileExtensions().map((ext) => (ext.includes('.') ? ext : '.' + ext))
  );

  helpText = computed(() => {
    const extensions = this.sanitizedFileExtensions();
    let text = '';

    if (extensions.length === 1) {
      text = `${extensions[0]} format allowed`;
    }

    if (extensions.length > 1) {
      text = extensions.join(', ') + ' formats allowed';
    }

    return text;
  });

  constructor() {
    effect(() => {
      const files = this.selectedFile();

      if (files) {
        this.attachmentState.set('upload');
      } else {
        this.attachmentState.set(undefined);
      }
    });
  }

  openFileSelector() {
    this.fileSelectorElement.click();
  }

  selectFiles(fileList: FileList | null): void {
    if (!fileList) return;
    if (!acceptableFile(fileList[0], this.sanitizedFileExtensions())) return;
    this.selectedFile.set(fileList[0]);
    this.fileAttached.emit(fileList[0]);
  }

  onFileInputChange() {
    this.selectFiles(this.fileSelectorElement.files);
    this.fileSelectorElement.value = '';
  }

  cancelUpload() {
    this.selectedFile.set(undefined);
    this.fileAttached.emit(undefined);
    this.fileRemoved.emit();
  }

  removeAttachment() {
    this.selectedFile.set(undefined);
  }
}
