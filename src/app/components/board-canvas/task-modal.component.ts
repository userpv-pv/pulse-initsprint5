import { Component, Input, Output, EventEmitter, inject, signal, OnInit, OnChanges, HostListener, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { Task, ChecklistItem, Attachment } from '../../models/board.model';
import { BoardService } from '../../services/board.service';
import { marked } from 'marked';
import { v4 as uuidv4 } from 'uuid';

interface TagColor {
  name: string;
  value: string;
  gradient: string;
}

@Component({
  selector: 'app-task-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DragDropModule],
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center smooth-transition backdrop-blur-sm"
        (click)="onBackdropClick($event)">

        <div
          class="bg-surface rounded-t-3xl md:rounded-2xl shadow-2xl w-full md:max-w-4xl md:max-h-[90vh] overflow-hidden border border-color smooth-transition modal-container"
          [class.mobile-fullscreen]="isMobile()"
          (click)="$event.stopPropagation()">

          <!-- Modal Header -->
          <div class="sticky top-0 bg-surface border-b border-color px-6 py-4 flex items-center justify-between z-10">
            <div class="flex items-center gap-3">
              <div
                class="w-5 h-5 rounded-full flex-shrink-0"
                [style.background-color]="getPriorityColor(taskForm.get('priority')?.value)">
              </div>
              <h2 class="text-xl font-bold">{{ isNewTask ? 'Create Task' : 'Edit Task' }}</h2>
              @if (!isNewTask) {
                <span class="text-xs text-secondary px-2 py-1 rounded bg-surface border border-color">
                  ID: {{ task.id.substring(0, 8) }}
                </span>
              }
            </div>
            <div class="flex items-center gap-2">
              @if (!isNewTask) {
                <button
                  type="button"
                  (click)="toggleArchive()"
                  class="p-2 rounded-lg hover:bg-surface smooth-transition border border-color"
                  [title]="task.archived ? 'Unarchive' : 'Archive'">
                  <span class="material-symbols-outlined text-lg">
                    {{ task.archived ? 'unarchive' : 'archive' }}
                  </span>
                </button>
              }
              <button
                type="button"
                (click)="onClose()"
                class="p-2 rounded-lg hover:bg-surface smooth-transition border border-color">
                <span class="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          </div>

          <!-- Modal Content -->
          <form [formGroup]="taskForm" (ngSubmit)="onSave()" class="overflow-y-auto modal-content">
            <div class="px-6 py-6 space-y-6">

              <!-- Title Section -->
              <div>
                <label for="task-title" class="block text-sm font-semibold mb-2">
                  Title <span class="text-red-500">*</span>
                </label>
                <input
                  id="task-title"
                  type="text"
                  formControlName="title"
                  placeholder="Enter task title..."
                  class="w-full px-4 py-3 rounded-lg border border-color bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none smooth-transition"
                  [class.border-red-500]="taskForm.get('title')?.invalid && taskForm.get('title')?.touched"
                  autofocus>
                @if (taskForm.get('title')?.invalid && taskForm.get('title')?.touched) {
                  <p class="text-red-500 text-xs mt-1">Title is required</p>
                }
              </div>

              <!-- Description Section with Markdown -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <label for="task-description" class="block text-sm font-semibold">
                    Description
                  </label>
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      (click)="toggleMarkdownPreview()"
                      class="text-xs px-3 py-1 rounded-lg border border-color hover:bg-surface smooth-transition">
                      {{ showMarkdownPreview() ? 'Edit' : 'Preview' }}
                    </button>
                    <span class="text-xs text-secondary">Markdown supported</span>
                  </div>
                </div>

                @if (!showMarkdownPreview()) {
                  <textarea
                    id="task-description"
                    formControlName="description"
                    placeholder="Add detailed description... (Markdown supported: **bold**, *italic*, - lists)"
                    rows="6"
                    class="w-full px-4 py-3 rounded-lg border border-color bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none smooth-transition resize-none font-mono text-sm">
                  </textarea>
                } @else {
                  <div
                    class="w-full px-4 py-3 rounded-lg border border-color bg-background min-h-[150px] prose prose-sm max-w-none"
                    [innerHTML]="getMarkdownPreview()">
                  </div>
                }
              </div>

              <!-- Priority & Status Row -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label for="task-priority" class="block text-sm font-semibold mb-2">
                    Priority
                  </label>
                  <select
                    id="task-priority"
                    formControlName="priority"
                    class="w-full px-4 py-3 rounded-lg border border-color bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none smooth-transition">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label for="task-status" class="block text-sm font-semibold mb-2">
                    Status
                  </label>
                  <select
                    id="task-status"
                    formControlName="status"
                    class="w-full px-4 py-3 rounded-lg border border-color bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none smooth-transition">
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div>
                  <label for="task-due-date" class="block text-sm font-semibold mb-2">
                    Due Date
                  </label>
                  <input
                    id="task-due-date"
                    type="date"
                    formControlName="dueDate"
                    class="w-full px-4 py-3 rounded-lg border border-color bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none smooth-transition">
                </div>
              </div>

              <!-- Tags/Labels with Color Picker -->
              <div>
                <label class="block text-sm font-semibold mb-3">
                  Labels
                </label>

                <!-- Existing Tags -->
                <div class="flex flex-wrap gap-2 mb-4">
                  @for (tag of tags(); track tag.name) {
                    <div
                      class="inline-flex items-center gap-2 px-3 py-2 rounded-lg border smooth-transition group"
                      [style.background-color]="tag.color + '20'"
                      [style.border-color]="tag.color + '40'"
                      [style.color]="tag.color">
                      <span class="font-medium">{{ tag.name }}</span>
                      <button
                        type="button"
                        (click)="removeTag(tag.name)"
                        class="opacity-60 hover:opacity-100 smooth-transition">
                        <span class="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  }
                  @if (tags().length === 0) {
                    <p class="text-sm text-secondary italic">No labels added</p>
                  }
                </div>

                <!-- Add Tag Form -->
                <div class="space-y-3">
                  <div class="flex gap-2">
                    <input
                      type="text"
                      [(ngModel)]="newTagName"
                      [ngModelOptions]="{standalone: true}"
                      (keydown.enter)="$event.preventDefault(); addTag()"
                      placeholder="Label name..."
                      maxlength="20"
                      class="flex-1 px-4 py-2 rounded-lg border border-color bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none smooth-transition text-sm">
                    <button
                      type="button"
                      (click)="toggleColorPicker()"
                      class="px-4 py-2 rounded-lg border border-color hover:bg-surface smooth-transition flex items-center gap-2">
                      <div
                        class="w-5 h-5 rounded"
                        [style.background-color]="selectedTagColor()">
                      </div>
                      <span class="material-symbols-outlined text-lg">palette</span>
                    </button>
                    <button
                      type="button"
                      (click)="addTag()"
                      [disabled]="!newTagName.trim()"
                      class="px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90 smooth-transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                      Add
                    </button>
                  </div>

                  <!-- Color Picker -->
                  @if (showColorPicker()) {
                    <div class="p-4 rounded-lg border border-color bg-surface">
                      <p class="text-xs font-semibold mb-3 text-secondary">SELECT COLOR</p>
                      <div class="grid grid-cols-8 gap-2">
                        @for (color of tagColors; track color.value) {
                          <button
                            type="button"
                            (click)="selectTagColor(color.value)"
                            class="w-8 h-8 rounded-lg smooth-transition hover:scale-110 active:scale-95 border-2"
                            [class.border-primary]="selectedTagColor() === color.value"
                            [class.border-transparent]="selectedTagColor() !== color.value"
                            [class.ring-2]="selectedTagColor() === color.value"
                            [class.ring-primary]="selectedTagColor() === color.value"
                            [style.background]="color.gradient"
                            [title]="color.name">
                          </button>
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Checklist Section -->
              <div>
                <div class="flex items-center justify-between mb-3">
                  <label class="block text-sm font-semibold">
                    Checklist
                  </label>
                  @if (checklist().length > 0) {
                    <div class="flex items-center gap-2 text-sm">
                      <span class="text-secondary">{{ getChecklistProgress() }}% complete</span>
                      <div class="w-24 h-2 bg-surface rounded-full overflow-hidden border border-color">
                        <div
                          class="h-full bg-gradient-to-r from-green-400 to-green-600 smooth-transition"
                          [style.width.%]="getChecklistProgress()">
                        </div>
                      </div>
                    </div>
                  }
                </div>

                <!-- Checklist Items with Drag & Drop -->
                @if (checklist().length > 0) {
                  <div
                    cdkDropList
                    (cdkDropListDropped)="onChecklistDrop($event)"
                    class="space-y-2 mb-3">
                    @for (item of checklist(); track item.id; let idx = $index) {
                      <div
                        cdkDrag
                        class="flex items-center gap-3 p-3 rounded-lg hover:bg-surface smooth-transition border border-color group">
                        <div
                          cdkDragHandle
                          class="cursor-move opacity-0 group-hover:opacity-100 smooth-transition">
                          <span class="material-symbols-outlined text-secondary text-lg">drag_indicator</span>
                        </div>
                        <input
                          type="checkbox"
                          [(ngModel)]="item.completed"
                          [ngModelOptions]="{standalone: true}"
                          (change)="updateChecklistItem(item)"
                          class="w-5 h-5 rounded accent-primary cursor-pointer">
                        <input
                          type="text"
                          [(ngModel)]="item.title"
                          [ngModelOptions]="{standalone: true}"
                          (blur)="updateChecklistItem(item)"
                          [class.line-through]="item.completed"
                          [class.text-secondary]="item.completed"
                          class="flex-1 px-2 py-1 rounded border border-transparent hover:border-color focus:border-primary outline-none smooth-transition bg-transparent">
                        <button
                          type="button"
                          (click)="removeChecklistItem(item.id)"
                          class="p-1 rounded hover:bg-red-100 smooth-transition text-red-600 opacity-0 group-hover:opacity-100">
                          <span class="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    }
                  </div>
                }

                <!-- Add Checklist Item -->
                <div class="flex gap-2">
                  <input
                    type="text"
                    [(ngModel)]="newChecklistItem"
                    [ngModelOptions]="{standalone: true}"
                    (keydown.enter)="$event.preventDefault(); addChecklistItem()"
                    placeholder="Add checklist item..."
                    class="flex-1 px-4 py-2 rounded-lg border border-color bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none smooth-transition text-sm">
                  <button
                    type="button"
                    (click)="addChecklistItem()"
                    [disabled]="!newChecklistItem.trim()"
                    class="px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90 smooth-transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                    <span class="material-symbols-outlined text-lg">add</span>
                    <span>Add</span>
                  </button>
                </div>
              </div>

              <!-- Attachments Section with Drag & Drop -->
              <div>
                <label class="block text-sm font-semibold mb-3">
                  Attachments
                </label>

                <!-- Drag & Drop Area -->
                <div
                  (drop)="onFileDrop($event)"
                  (dragover)="onDragOver($event)"
                  (dragleave)="onDragLeave($event)"
                  [class.drag-over]="isDragging()"
                  class="border-2 border-dashed rounded-lg p-6 text-center smooth-transition cursor-pointer hover:border-primary"
                  [class.border-primary]="isDragging()"
                  [class.bg-primary/5]="isDragging()">
                  <input
                    #fileInput
                    type="file"
                    multiple
                    (change)="onFileSelect($event)"
                    class="hidden">
                  <div (click)="fileInput.click()" class="space-y-2">
                    <span class="material-symbols-outlined text-4xl text-secondary block">cloud_upload</span>
                    <p class="text-sm font-medium">
                      Drag & drop files or <span class="text-primary">browse</span>
                    </p>
                    <p class="text-xs text-secondary">Supports all file types</p>
                  </div>
                </div>

                <!-- Attachment List -->
                @if (attachments().length > 0) {
                  <div class="mt-4 space-y-2">
                    @for (attachment of attachments(); track attachment.id) {
                      <div class="flex items-center justify-between p-3 rounded-lg bg-surface border border-color group">
                        <div class="flex items-center gap-3 flex-1 min-w-0">
                          <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span class="material-symbols-outlined text-primary">{{ getFileIcon(attachment.type) }}</span>
                          </div>
                          <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium truncate">{{ attachment.name }}</p>
                            <p class="text-xs text-secondary">{{ formatFileSize(attachment.size) }}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          (click)="removeAttachment(attachment.id)"
                          class="p-2 rounded-lg hover:bg-red-100 smooth-transition text-red-600 opacity-0 group-hover:opacity-100">
                          <span class="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    }
                  </div>
                }
              </div>

              <!-- Metadata -->
              @if (!isNewTask) {
                <div class="pt-4 border-t border-color">
                  <div class="grid grid-cols-2 gap-4 text-xs text-secondary">
                    <div>
                      <span class="font-semibold">Created:</span>
                      {{ task.createdAt | date: 'MMM d, y HH:mm' }}
                    </div>
                    <div>
                      <span class="font-semibold">Updated:</span>
                      {{ task.updatedAt | date: 'MMM d, y HH:mm' }}
                    </div>
                  </div>
                </div>
              }
            </div>
          </form>

          <!-- Modal Footer -->
          <div class="sticky bottom-0 bg-surface border-t border-color px-6 py-4 flex items-center justify-between">
            <div class="flex items-center gap-2 text-xs text-secondary">
              <span class="material-symbols-outlined text-sm">info</span>
              <span class="hidden md:inline">Press <kbd class="px-2 py-1 rounded bg-surface border border-color font-mono">Esc</kbd> to close, <kbd class="px-2 py-1 rounded bg-surface border border-color font-mono">Ctrl+Enter</kbd> to save</span>
              <span class="md:hidden">Shortcuts enabled</span>
            </div>
            <div class="flex items-center gap-3">
              <button
                type="button"
                (click)="onClose()"
                class="px-5 py-2.5 rounded-lg border border-color hover:bg-surface smooth-transition font-medium">
                Cancel
              </button>
              <button
                type="submit"
                (click)="onSave()"
                [disabled]="taskForm.invalid"
                class="px-5 py-2.5 rounded-lg bg-primary text-white hover:opacity-90 smooth-transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                <span class="material-symbols-outlined text-lg">{{ isNewTask ? 'add' : 'save' }}</span>
                <span>{{ isNewTask ? 'Create Task' : 'Save Changes' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      display: contents;
    }

    .modal-container {
      max-height: 90vh;
      display: flex;
      flex-direction: column;
    }

    .modal-content {
      flex: 1;
      overflow-y: auto;
    }

    .mobile-fullscreen {
      height: 95vh;
      border-radius: 1.5rem 1.5rem 0 0;
    }

    .drag-over {
      background-color: rgba(59, 130, 246, 0.05);
    }

    .prose {
      color: rgb(var(--color-text));
    }

    .prose h1, .prose h2, .prose h3 {
      color: rgb(var(--color-text));
      margin-top: 1em;
      margin-bottom: 0.5em;
    }

    .prose p {
      margin-bottom: 0.75em;
    }

    .prose ul, .prose ol {
      margin-left: 1.5em;
      margin-bottom: 0.75em;
    }

    .prose code {
      background-color: rgb(var(--color-surface));
      padding: 0.2em 0.4em;
      border-radius: 0.25rem;
      font-size: 0.875em;
    }

    .prose pre {
      background-color: rgb(var(--color-surface));
      padding: 1em;
      border-radius: 0.5rem;
      overflow-x: auto;
    }

    .prose blockquote {
      border-left: 4px solid rgb(var(--color-primary));
      padding-left: 1em;
      margin-left: 0;
      color: rgb(var(--color-text-secondary));
    }

    .prose a {
      color: rgb(var(--color-primary));
      text-decoration: underline;
    }

    .cdk-drag-preview {
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
      opacity: 0.9;
    }

    .cdk-drag-placeholder {
      opacity: 0.3;
    }

    kbd {
      font-size: 0.75rem;
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .modal-container {
        max-height: 95vh;
      }
    }

    ::-webkit-scrollbar {
      width: 8px;
    }

    ::-webkit-scrollbar-track {
      background: transparent;
    }

    ::-webkit-scrollbar-thumb {
      background: rgb(var(--color-border));
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: rgb(var(--color-text-secondary));
    }
  `]
})
export class TaskModalComponent implements OnInit, OnChanges {
  @Input() task!: Task;
  @Input() isOpen = signal(false);
  @Input() isNewTask = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Task>();

  private boardService = inject(BoardService);
  private fb = inject(FormBuilder);

  taskForm!: FormGroup;
  showMarkdownPreview = signal(false);
  showColorPicker = signal(false);
  isDragging = signal(false);
  isMobile = signal(false);

  tags = signal<Array<{ name: string; color: string }>>([]);
  checklist = signal<ChecklistItem[]>([]);
  attachments = signal<Attachment[]>([]);

  newTagName = '';
  selectedTagColor = signal('#3b82f6');
  newChecklistItem = '';

  tagColors: TagColor[] = [
    { name: 'Blue', value: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)' },
    { name: 'Red', value: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' },
    { name: 'Orange', value: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
    { name: 'Yellow', value: '#eab308', gradient: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)' },
    { name: 'Green', value: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)' },
    { name: 'Teal', value: '#14b8a6', gradient: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)' },
    { name: 'Cyan', value: '#06b6d4', gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' },
    { name: 'Sky', value: '#0ea5e9', gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)' },
    { name: 'Pink', value: '#ec4899', gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' },
    { name: 'Rose', value: '#f43f5e', gradient: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' },
    { name: 'Emerald', value: '#059669', gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)' },
    { name: 'Amber', value: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)' },
    { name: 'Lime', value: '#84cc16', gradient: 'linear-gradient(135deg, #84cc16 0%, #65a30d 100%)' },
    { name: 'Slate', value: '#64748b', gradient: 'linear-gradient(135deg, #64748b 0%, #475569 100%)' },
    { name: 'Gray', value: '#6b7280', gradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)' },
    { name: 'Zinc', value: '#71717a', gradient: 'linear-gradient(135deg, #71717a 0%, #52525b 100%)' }
  ];

  constructor() {
    this.checkMobile();
    effect(() => {
      if (this.isOpen()) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
  }

  ngOnInit() {
    this.initializeForm();
    this.loadTaskData();
  }

  ngOnChanges() {
    if (this.taskForm) {
      this.loadTaskData();
    }
  }

  private initializeForm() {
    const dueDate = this.task?.dueDate ? new Date(this.task.dueDate).toISOString().split('T')[0] : '';

    this.taskForm = this.fb.group({
      title: [this.task?.title || '', Validators.required],
      description: [this.task?.description || ''],
      priority: [this.task?.priority || 'medium'],
      status: [this.task?.status || 'todo'],
      dueDate: [dueDate]
    });
  }

  private loadTaskData() {
    if (!this.task) return;

    const dueDate = this.task.dueDate ? new Date(this.task.dueDate).toISOString().split('T')[0] : '';

    this.taskForm.patchValue({
      title: this.task.title,
      description: this.task.description || '',
      priority: this.task.priority,
      status: this.task.status,
      dueDate
    });

    const tagsWithColors = this.task.tags.map(tagName => ({
      name: tagName,
      color: this.getTagColorFromName(tagName)
    }));
    this.tags.set(tagsWithColors);

    this.checklist.set(this.task.checklist ? [...this.task.checklist] : []);
    this.attachments.set(this.task.attachments ? [...this.task.attachments] : []);
  }

  private getTagColorFromName(tagName: string): string {
    const hash = tagName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return this.tagColors[hash % this.tagColors.length].value;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardShortcuts(event: KeyboardEvent) {
    if (!this.isOpen()) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      this.onClose();
    }

    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      if (this.taskForm.valid) {
        this.onSave();
      }
    }
  }

  @HostListener('window:resize')
  checkMobile() {
    this.isMobile.set(window.innerWidth < 768);
  }

  toggleMarkdownPreview() {
    this.showMarkdownPreview.update(v => !v);
  }

  getMarkdownPreview(): string {
    const description = this.taskForm.get('description')?.value || '';
    if (!description.trim()) {
      return '<p class="text-secondary italic">No description provided</p>';
    }
    try {
      return marked.parse(description) as string;
    } catch (error) {
      return `<p class="text-red-500">Error parsing Markdown</p>`;
    }
  }

  toggleColorPicker() {
    this.showColorPicker.update(v => !v);
  }

  selectTagColor(color: string) {
    this.selectedTagColor.set(color);
  }

  addTag() {
    const tagName = this.newTagName.trim();
    if (!tagName) return;

    const existingTag = this.tags().find(t => t.name.toLowerCase() === tagName.toLowerCase());
    if (existingTag) {
      this.newTagName = '';
      return;
    }

    this.tags.update(tags => [...tags, { name: tagName, color: this.selectedTagColor() }]);
    this.newTagName = '';
    this.showColorPicker.set(false);

    const randomColor = this.tagColors[Math.floor(Math.random() * this.tagColors.length)];
    this.selectedTagColor.set(randomColor.value);
  }

  removeTag(tagName: string) {
    this.tags.update(tags => tags.filter(t => t.name !== tagName));
  }

  addChecklistItem() {
    const title = this.newChecklistItem.trim();
    if (!title) return;

    const newItem: ChecklistItem = {
      id: uuidv4(),
      title,
      completed: false
    };

    this.checklist.update(items => [...items, newItem]);
    this.newChecklistItem = '';
  }

  updateChecklistItem(item: ChecklistItem) {
    this.checklist.update(items =>
      items.map(i => i.id === item.id ? { ...item } : i)
    );
  }

  removeChecklistItem(id: string) {
    this.checklist.update(items => items.filter(i => i.id !== id));
  }

  onChecklistDrop(event: CdkDragDrop<ChecklistItem[]>) {
    const items = [...this.checklist()];
    moveItemInArray(items, event.previousIndex, event.currentIndex);
    this.checklist.set(items);
  }

  getChecklistProgress(): number {
    const items = this.checklist();
    if (items.length === 0) return 0;
    const completed = items.filter(i => i.completed).length;
    return Math.round((completed / items.length) * 100);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(files);
    }
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(input.files);
    }
  }

  private handleFiles(files: FileList) {
    Array.from(files).forEach(file => {
      const attachment: Attachment = {
        id: uuidv4(),
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type || 'application/octet-stream',
        size: file.size
      };
      this.attachments.update(items => [...items, attachment]);
    });
  }

  removeAttachment(id: string) {
    const attachment = this.attachments().find(a => a.id === id);
    if (attachment) {
      URL.revokeObjectURL(attachment.url);
    }
    this.attachments.update(items => items.filter(a => a.id !== id));
  }

  getFileIcon(type: string): string {
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'videocam';
    if (type.startsWith('audio/')) return 'audio_file';
    if (type.includes('pdf')) return 'picture_as_pdf';
    if (type.includes('word') || type.includes('document')) return 'description';
    if (type.includes('sheet') || type.includes('excel')) return 'table_chart';
    if (type.includes('presentation') || type.includes('powerpoint')) return 'slideshow';
    if (type.includes('zip') || type.includes('rar') || type.includes('compressed')) return 'folder_zip';
    return 'insert_drive_file';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  }

  toggleArchive() {
    if (!this.isNewTask) {
      const archived = !this.task.archived;
      this.boardService.updateTask(this.task.id, { archived });
      this.task = { ...this.task, archived };
    }
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  onClose() {
    this.showMarkdownPreview.set(false);
    this.showColorPicker.set(false);
    this.close.emit();
  }

  onSave() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const formValue = this.taskForm.value;
    const taskData = {
      ...this.task,
      title: formValue.title,
      description: formValue.description,
      priority: formValue.priority,
      status: formValue.status,
      dueDate: formValue.dueDate ? new Date(formValue.dueDate) : undefined,
      tags: this.tags().map(t => t.name),
      checklist: this.checklist(),
      attachments: this.attachments(),
      updatedAt: new Date()
    };

    if (this.isNewTask) {
      const newTask = this.boardService.addTask({
        listId: this.task.listId,
        boardId: this.task.boardId,
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        status: taskData.status,
        dueDate: taskData.dueDate,
        tags: taskData.tags,
        checklist: taskData.checklist,
        attachments: taskData.attachments,
        position: this.task.position || 0
      });
      this.save.emit(newTask);
    } else {
      this.boardService.updateTask(this.task.id, {
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        status: taskData.status,
        dueDate: taskData.dueDate,
        tags: taskData.tags,
        checklist: taskData.checklist,
        attachments: taskData.attachments
      });
      this.save.emit(taskData as Task);
    }

    this.onClose();
  }
}
