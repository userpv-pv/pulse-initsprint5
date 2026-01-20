import { Component, Input, Output, EventEmitter, inject, signal, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task, ChecklistItem, Attachment } from '../../models/board.model';
import { BoardService } from '../../services/board.service';

@Component({
  selector: 'app-task-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4 smooth-transition"
        (click)="onClose()">

        <div
          class="bg-surface rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-color smooth-transition"
          (click)="$event.stopPropagation()">

          <!-- Modal Header -->
          <div class="sticky top-0 bg-surface border-b border-color px-6 py-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div
                class="w-4 h-4 rounded-full"
                [class.bg-red-500]="editingTask.priority === 'high'"
                [class.bg-yellow-500]="editingTask.priority === 'medium'"
                [class.bg-green-500]="editingTask.priority === 'low'">
              </div>
              <h2 class="text-lg font-bold">{{ isEditing() ? 'Edit Task' : 'Task Details' }}</h2>
            </div>
            <button
              (click)="onClose()"
              class="p-2 rounded-lg hover:bg-surface smooth-transition">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Modal Content -->
          <div class="px-6 py-6 space-y-6">

            <!-- Title Section -->
            <div>
              <label class="block text-sm font-semibold mb-2">Title</label>
              @if (isEditing()) {
                <input
                  type="text"
                  [(ngModel)]="editingTask.title"
                  class="w-full px-4 py-2 rounded-lg border border-color bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none smooth-transition">
              } @else {
                <h3 class="text-xl font-bold">{{ task.title }}</h3>
              }
            </div>

            <!-- Description Section -->
            <div>
              <label class="block text-sm font-semibold mb-2">Description</label>
              @if (isEditing()) {
                <textarea
                  [(ngModel)]="editingTask.description"
                  placeholder="Add task description..."
                  rows="4"
                  class="w-full px-4 py-2 rounded-lg border border-color bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none smooth-transition resize-none">
                </textarea>
              } @else {
                @if (task.description) {
                  <p class="text-secondary whitespace-pre-wrap">{{ task.description }}</p>
                } @else {
                  <p class="text-secondary italic">No description added</p>
                }
              }
            </div>

            <!-- Priority & Status Row -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold mb-2">Priority</label>
                @if (isEditing()) {
                  <select
                    [(ngModel)]="editingTask.priority"
                    class="w-full px-4 py-2 rounded-lg border border-color bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none smooth-transition">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                } @else {
                  <div
                    class="px-3 py-2 rounded-lg text-sm font-medium text-center border"
                    [class.bg-green-100]="task.priority === 'low'"
                    [class.text-green-700]="task.priority === 'low'"
                    [class.bg-yellow-100]="task.priority === 'medium'"
                    [class.text-yellow-700]="task.priority === 'medium'"
                    [class.bg-red-100]="task.priority === 'high'"
                    [class.text-red-700]="task.priority === 'high'">
                    {{ task.priority | uppercase }}
                  </div>
                }
              </div>

              <div>
                <label class="block text-sm font-semibold mb-2">Status</label>
                @if (isEditing()) {
                  <select
                    [(ngModel)]="editingTask.status"
                    class="w-full px-4 py-2 rounded-lg border border-color bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none smooth-transition">
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                } @else {
                  <div
                    class="px-3 py-2 rounded-lg text-sm font-medium text-center border"
                    [class.bg-blue-100]="task.status === 'todo'"
                    [class.text-blue-700]="task.status === 'todo'"
                    [class.bg-yellow-100]="task.status === 'in-progress'"
                    [class.text-yellow-700]="task.status === 'in-progress'"
                    [class.bg-green-100]="task.status === 'done'"
                    [class.text-green-700]="task.status === 'done'">
                    {{ task.status === 'in-progress' ? 'In Progress' : (task.status | uppercase) }}
                  </div>
                }
              </div>
            </div>

            <!-- Due Date -->
            <div>
              <label class="block text-sm font-semibold mb-2">Due Date</label>
              @if (isEditing()) {
                <input
                  type="date"
                  [(ngModel)]="editingTask.dueDate"
                  class="w-full px-4 py-2 rounded-lg border border-color bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none smooth-transition">
              } @else {
                @if (task.dueDate) {
                  <div class="px-3 py-2 rounded-lg text-sm bg-surface border border-color">
                    {{ task.dueDate | date: 'MMM d, yyyy' }}
                  </div>
                } @else {
                  <div class="px-3 py-2 rounded-lg text-sm text-secondary">No due date</div>
                }
              }
            </div>

            <!-- Tags/Labels -->
            <div>
              <label class="block text-sm font-semibold mb-2">Tags</label>
              <div class="flex flex-wrap gap-2 mb-3">
                @for (tag of editingTask.tags; track tag) {
                  <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-color">
                    <span>{{ tag }}</span>
                    @if (isEditing()) {
                      <button
                        (click)="removeTag(tag)"
                        class="text-secondary hover:text-primary smooth-transition">
                        <span class="material-symbols-outlined text-sm">close</span>
                      </button>
                    }
                  </div>
                }
              </div>
              @if (isEditing()) {
                <div class="flex gap-2">
                  <input
                    type="text"
                    [(ngModel)]="newTag"
                    placeholder="Add a tag..."
                    (keydown.enter)="addTag()"
                    class="flex-1 px-4 py-2 rounded-lg border border-color bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none smooth-transition text-sm">
                  <button
                    (click)="addTag()"
                    class="px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90 smooth-transition font-medium text-sm">
                    Add
                  </button>
                </div>
              }
            </div>

            <!-- Checklist Section -->
            @if (editingTask.checklist && editingTask.checklist.length > 0) {
              <div>
                <label class="block text-sm font-semibold mb-3">Checklist</label>
                <div class="space-y-2 mb-3">
                  <div class="flex items-center justify-between text-sm text-secondary mb-2">
                    <span>Progress</span>
                    <span>{{ getChecklistProgress() }}%</span>
                  </div>
                  <div class="w-full h-2 bg-surface rounded-full overflow-hidden border border-color">
                    <div
                      class="h-full bg-gradient-to-r from-blue-400 to-blue-600 smooth-transition"
                      [style.width.%]="getChecklistProgress()">
                    </div>
                  </div>
                </div>
                <div class="space-y-1">
                  @for (item of editingTask.checklist; track item.id) {
                    <div class="flex items-center gap-2 p-2 rounded hover:bg-surface smooth-transition">
                      <input
                        type="checkbox"
                        [(ngModel)]="item.completed"
                        class="w-5 h-5 rounded accent-primary"
                        [disabled]="!isEditing()">
                      <span [class.line-through]="item.completed" [class.text-secondary]="item.completed">
                        {{ item.title }}
                      </span>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Attachments -->
            @if (editingTask.attachments && editingTask.attachments.length > 0) {
              <div>
                <label class="block text-sm font-semibold mb-3">Attachments</label>
                <div class="space-y-2">
                  @for (attachment of editingTask.attachments; track attachment.id) {
                    <div class="flex items-center justify-between p-3 rounded-lg bg-surface border border-color">
                      <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-lg">attachment</span>
                        <div>
                          <p class="text-sm font-medium">{{ attachment.name }}</p>
                          <p class="text-xs text-secondary">{{ formatFileSize(attachment.size) }}</p>
                        </div>
                      </div>
                      @if (isEditing()) {
                        <button
                          (click)="removeAttachment(attachment.id)"
                          class="p-1 rounded hover:bg-red-100 smooth-transition text-red-600">
                          <span class="material-symbols-outlined">delete</span>
                        </button>
                      }
                    </div>
                  }
                </div>
              </div>
            }

          </div>

          <!-- Modal Footer -->
          <div class="sticky bottom-0 bg-surface border-t border-color px-6 py-4 flex items-center justify-between">
            <div class="text-xs text-secondary">
              Updated {{ task.updatedAt | date: 'MMM d, HH:mm' }}
            </div>
            <div class="flex items-center gap-3">
              @if (isEditing()) {
                <button
                  (click)="cancelEdit()"
                  class="px-4 py-2 rounded-lg border border-color hover:bg-surface smooth-transition font-medium">
                  Cancel
                </button>
                <button
                  (click)="saveEdit()"
                  class="px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90 smooth-transition font-medium">
                  Save Changes
                </button>
              } @else {
                <button
                  (click)="enableEdit()"
                  class="px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90 smooth-transition font-medium">
                  Edit Task
                </button>
              }
              <button
                (click)="onClose()"
                class="px-4 py-2 rounded-lg border border-color hover:bg-surface smooth-transition font-medium">
                Close
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

    .smooth-transition {
      transition: all 200ms ease-out;
    }
  `]
})
export class TaskModalComponent implements OnInit, OnChanges {
  @Input() task!: Task;
  @Input() isOpen = signal(false);
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Task>();

  private boardService = inject(BoardService);

  isEditing = signal(false);
  editingTask!: Task;
  newTag = '';

  ngOnInit() {
    this.editingTask = { ...this.task };
  }

  ngOnChanges() {
    if (!this.isEditing()) {
      this.editingTask = { ...this.task };
    }
  }

  getChecklistProgress(): number {
    if (!this.editingTask.checklist || this.editingTask.checklist.length === 0) return 0;
    const completed = this.editingTask.checklist.filter(item => item.completed).length;
    return Math.round((completed / this.editingTask.checklist.length) * 100);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  enableEdit() {
    this.isEditing.set(true);
    this.editingTask = { ...this.task };
  }

  cancelEdit() {
    this.isEditing.set(false);
    this.editingTask = { ...this.task };
    this.newTag = '';
  }

  saveEdit() {
    const updates = {
      title: this.editingTask.title,
      description: this.editingTask.description,
      priority: this.editingTask.priority,
      status: this.editingTask.status,
      tags: this.editingTask.tags,
      dueDate: this.editingTask.dueDate,
      checklist: this.editingTask.checklist,
      attachments: this.editingTask.attachments
    };

    this.boardService.updateTask(this.task.id, updates);
    this.save.emit({ ...this.task, ...updates });
    this.isEditing.set(false);
  }

  addTag() {
    const tag = this.newTag.trim();
    if (tag && !this.editingTask.tags.includes(tag)) {
      this.editingTask.tags.push(tag);
      this.newTag = '';
    }
  }

  removeTag(tag: string) {
    this.editingTask.tags = this.editingTask.tags.filter(t => t !== tag);
  }

  removeAttachment(id: string) {
    if (this.editingTask.attachments) {
      this.editingTask.attachments = this.editingTask.attachments.filter(a => a.id !== id);
    }
  }

  onClose() {
    this.isEditing.set(false);
    this.close.emit();
  }
}
