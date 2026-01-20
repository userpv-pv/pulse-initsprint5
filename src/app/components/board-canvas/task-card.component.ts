import { Component, Input, Output, EventEmitter, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Task } from '../../models/board.model';
import { BoardService } from '../../services/board.service';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  template: `
    <div
      cdkDragHandle
      (click)="onTaskClick()"
      class="task-card bg-background rounded-lg border border-color p-3 cursor-move hover:shadow-md hover:border-primary smooth-transition group">

      <!-- Priority & Drag Handle -->
      <div class="flex items-start gap-2">
        <div class="w-1 h-full rounded-full flex-shrink-0 mt-1 group-hover:w-2 smooth-transition"
          [class.bg-red-500]="task.priority === 'high'"
          [class.bg-yellow-500]="task.priority === 'medium'"
          [class.bg-green-500]="task.priority === 'low'">
        </div>

        <div class="flex-1 min-w-0">
          <!-- Title -->
          <h4 class="font-medium text-sm mb-2 break-words line-clamp-2">{{ task.title }}</h4>

          <!-- Tags/Labels -->
          @if (task.tags.length > 0) {
            <div class="flex flex-wrap gap-1 mb-2">
              @for (tag of task.tags.slice(0, 2); track tag) {
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border"
                  [style.background-color]="getTagColor(tag) + '20'"
                  [style.color]="getTagColor(tag)"
                  [style.border-color]="getTagColor(tag) + '40'">
                  {{ tag }}
                </span>
              }
              @if (task.tags.length > 2) {
                <span class="text-xs text-secondary px-1">+{{ task.tags.length - 2 }}</span>
              }
            </div>
          }

          <!-- Metadata Row -->
          <div class="flex items-center justify-between gap-2 mb-2">
            <div class="flex items-center gap-1 min-w-0 flex-wrap">
              <!-- Due Date Badge -->
              @if (task.dueDate) {
                <div
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap"
                  [class.bg-red-100]="isDueOverdue(task.dueDate)"
                  [class.text-red-700]="isDueOverdue(task.dueDate)"
                  [class.bg-orange-100]="isDueToday(task.dueDate)"
                  [class.text-orange-700]="isDueToday(task.dueDate)"
                  [class.bg-green-100]="!isDueOverdue(task.dueDate) && !isDueToday(task.dueDate)"
                  [class.text-green-700]="!isDueOverdue(task.dueDate) && !isDueToday(task.dueDate)">
                  <span class="material-symbols-outlined text-sm">schedule</span>
                  <span>{{ formatDueDate(task.dueDate) }}</span>
                </div>
              }

              <!-- Status Badge (compact) -->
              <div
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                [class.bg-blue-100]="task.status === 'todo'"
                [class.text-blue-700]="task.status === 'todo'"
                [class.bg-yellow-100]="task.status === 'in-progress'"
                [class.text-yellow-700]="task.status === 'in-progress'"
                [class.bg-green-100]="task.status === 'done'"
                [class.text-green-700]="task.status === 'done'">
                {{ getStatusIcon(task.status) }}
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 smooth-transition flex-shrink-0">
              <button
                (click)="onArchive($event)"
                class="p-1 rounded hover:bg-surface smooth-transition"
                [title]="task.archived ? 'Unarchive' : 'Archive'">
                <span class="material-symbols-outlined text-sm">
                  {{ task.archived ? 'unarchive' : 'archive' }}
                </span>
              </button>
              <button
                (click)="onDelete($event)"
                class="p-1 rounded hover:bg-red-100 smooth-transition text-red-600"
                title="Delete">
                <span class="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          </div>

          <!-- Checklist Progress -->
          @if (task.checklist && task.checklist.length > 0) {
            <div class="space-y-1">
              <div class="flex items-center justify-between text-xs text-secondary mb-1">
                <span>Checklist</span>
                <span>{{ getChecklistProgress() }}%</span>
              </div>
              <div class="w-full h-1.5 bg-surface rounded-full overflow-hidden border border-color">
                <div
                  class="h-full bg-gradient-to-r from-blue-400 to-blue-600 smooth-transition"
                  [style.width.%]="getChecklistProgress()">
                </div>
              </div>
            </div>
          }

          <!-- Attachments Count -->
          @if (task.attachments && task.attachments.length > 0) {
            <div class="flex items-center gap-1 text-xs text-secondary mt-2">
              <span class="material-symbols-outlined text-sm">attachment</span>
              <span>{{ task.attachments.length }}</span>
            </div>
          }
        </div>
      </div>

      <!-- Expanded Description Preview (hover) -->
      <div class="mt-3 pt-3 border-t border-color opacity-0 group-hover:opacity-100 max-h-0 group-hover:max-h-24 smooth-transition overflow-hidden">
        @if (task.description) {
          <p class="text-xs text-secondary line-clamp-3">{{ task.description }}</p>
        } @else {
          <p class="text-xs text-secondary italic">No description</p>
        }
      </div>

      <!-- Drag Preview -->
      <div *cdkDragPreview class="task-card bg-background rounded-lg border border-primary p-3 shadow-xl">
        <h4 class="font-medium text-sm">{{ task.title }}</h4>
        <p class="text-xs text-secondary mt-1">{{ task.tags[0] || 'Task' }}</p>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: contents;
    }

    .task-card {
      transition: all 200ms ease-out;
    }

    .task-card:hover {
      transform: translateY(-2px);
    }

    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .cdk-drag-preview {
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
      opacity: 0.95;
    }

    @media (max-width: 768px) {
      .task-card {
        padding: 1rem;
        gap: 1rem;
      }

      .task-card h4 {
        font-size: 0.95rem;
        line-height: 1.4;
      }
    }
  `]
})
export class TaskCardComponent {
  @Input({ required: true }) task!: Task;
  @Output() taskClick = new EventEmitter<Task>();
  @Output() taskArchive = new EventEmitter<Task>();
  @Output() taskDelete = new EventEmitter<Task>();

  private boardService = inject(BoardService);

  getStatusIcon(status: string): string {
    switch (status) {
      case 'todo': return '○';
      case 'in-progress': return '◐';
      case 'done': return '✓';
      default: return '○';
    }
  }

  isDueOverdue(dueDate: Date): boolean {
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  }

  isDueToday(dueDate: Date): boolean {
    const due = new Date(dueDate);
    const today = new Date();
    due.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return due.getTime() === today.getTime();
  }

  formatDueDate(dueDate: Date): string {
    const due = new Date(dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (this.isDueToday(due)) {
      return 'Today';
    }

    if (due.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }

    if (this.isDueOverdue(due)) {
      return due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    return due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  getChecklistProgress(): number {
    if (!this.task.checklist || this.task.checklist.length === 0) return 0;
    const completed = this.task.checklist.filter(item => item.completed).length;
    return Math.round((completed / this.task.checklist.length) * 100);
  }

  getTagColor(tag: string): string {
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];
    const hash = tag.charCodeAt(0) + tag.charCodeAt(tag.length - 1);
    return colors[hash % colors.length];
  }

  onTaskClick() {
    this.taskClick.emit(this.task);
  }

  onArchive(event: Event) {
    event.stopPropagation();
    const archived = !this.task.archived;
    this.boardService.updateTask(this.task.id, { archived });
    this.taskArchive.emit({ ...this.task, archived });
  }

  onDelete(event: Event) {
    event.stopPropagation();
    if (confirm('Delete this task? This action cannot be undone.')) {
      this.boardService.deleteTask(this.task.id);
      this.taskDelete.emit(this.task);
    }
  }
}
