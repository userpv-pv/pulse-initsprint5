import { Component, Input, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { BoardService } from '../../services/board.service';
import { List, Task } from '../../models/board.model';
import { TaskCardComponent } from './task-card.component';
import { TaskModalComponent } from './task-modal.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, DragDropModule, TaskCardComponent, TaskModalComponent],
  template: `
    <div class="task-list-container flex-shrink-0 w-80 max-w-full">
      <div class="bg-surface rounded-xl border border-color shadow-sm h-full flex flex-col overflow-hidden">

        <!-- List Header -->
        <div class="px-4 py-3 border-b border-color flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 flex-1 min-w-0">
            <div
              class="w-3 h-3 rounded-full flex-shrink-0"
              [style.background-color]="boardColor">
            </div>
            <h3 class="font-semibold truncate">{{ list.name }}</h3>
            <span class="text-xs text-secondary bg-surface px-2 py-0.5 rounded-full border border-color">
              {{ tasks().length }}
            </span>
          </div>
          <button
            class="p-1 rounded hover:bg-surface smooth-transition"
            aria-label="List options">
            <span class="material-symbols-outlined text-lg text-secondary">more_vert</span>
          </button>
        </div>

        <!-- Tasks Container -->
        <div
          class="flex-1 overflow-y-auto px-3 py-3 space-y-2 custom-scrollbar"
          cdkDropList
          [cdkDropListData]="tasks()"
          [id]="list.id"
          [cdkDropListConnectedTo]="connectedLists"
          (cdkDropListDropped)="onTaskDrop($event)">

          @for (task of tasks(); track task.id) {
            <div cdkDrag>
              <app-task-card
                [task]="task"
                (taskClick)="onTaskOpen(task)"
                (taskArchive)="onTaskArchive($event)"
                (taskDelete)="onTaskDelete($event)">
              </app-task-card>
            </div>
          }

          @if (tasks().length === 0) {
            <div class="text-center py-8 text-secondary">
              <span class="material-symbols-outlined text-3xl mb-2 block opacity-50">inbox</span>
              <p class="text-sm">No tasks yet</p>
            </div>
          }
        </div>

        <!-- Add Task Button -->
        <div class="px-3 py-3 border-t border-color">
          <button
            (click)="addTask()"
            class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg hover:bg-surface smooth-transition text-sm border border-color">
            <span class="material-symbols-outlined text-lg">add</span>
            <span>Add Task</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Task Modal -->
    @if (selectedTask()) {
      <app-task-modal
        [task]="selectedTask()!"
        [isOpen]="isModalOpen"
        (close)="isModalOpen.set(false)"
        (save)="onTaskSave($event)">
      </app-task-modal>
    }
  `,
  styles: [`
    :host {
      display: contents;
    }

    .task-list-container {
      height: calc(100vh - 200px);
      min-height: 400px;
    }

    @media (max-width: 768px) {
      .task-list-container {
        width: 100%;
        height: auto;
        min-height: 300px;
        max-height: 600px;
      }
    }

    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }

    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgb(var(--color-border));
      border-radius: 3px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgb(var(--color-text-secondary));
    }

    .cdk-drag-preview {
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
      opacity: 0.9;
    }

    .cdk-drag-placeholder {
      opacity: 0.3;
      border: 2px dashed rgb(var(--color-border));
      background: rgb(var(--color-surface));
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .cdk-drop-list-dragging .cdk-drag {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class TaskListComponent {
  @Input({ required: true }) list!: List;
  @Input({ required: true }) boardColor!: string;
  @Input() connectedLists: string[] = [];

  private boardService = inject(BoardService);

  selectedTask = signal<Task | null>(null);
  isModalOpen = signal(false);

  tasks = computed(() => {
    return this.boardService
      .tasks()
      .filter(t => t.listId === this.list.id && !t.archived)
      .sort((a, b) => a.position - b.position);
  });

  onTaskDrop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      const tasks = [...event.container.data];
      moveItemInArray(tasks, event.previousIndex, event.currentIndex);

      tasks.forEach((task, index) => {
        this.boardService.updateTask(task.id, { position: index });
      });
    } else {
      const targetListId = event.container.id;
      const task = event.previousContainer.data[event.previousIndex];

      this.boardService.moveTask(task.id, targetListId, event.currentIndex);

      const targetTasks = [...event.container.data];
      targetTasks.forEach((t, index) => {
        if (t.id !== task.id) {
          this.boardService.updateTask(t.id, { position: index >= event.currentIndex ? index + 1 : index });
        }
      });
    }
  }

  addTask() {
    const taskCount = this.tasks().length;
    const board = this.boardService.activeBoard();

    if (!board) return;

    this.boardService.addTask({
      listId: this.list.id,
      boardId: board.id,
      title: 'New Task',
      description: '',
      priority: 'medium',
      status: 'todo',
      tags: [],
      position: taskCount
    });
  }

  onTaskOpen(task: Task) {
    this.selectedTask.set(task);
    this.isModalOpen.set(true);
  }

  onTaskArchive(task: Task) {
  }

  onTaskDelete(task: Task) {
  }

  onTaskSave(task: Task) {
    this.selectedTask.set(null);
    this.isModalOpen.set(false);
  }
}
