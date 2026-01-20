import { Component, Input, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { BoardService } from '../../services/board.service';
import { List, Task } from '../../models/board.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, DragDropModule],
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
            <div
              cdkDrag
              class="task-card bg-background rounded-lg border border-color p-3 cursor-move hover:shadow-md smooth-transition group">

              <!-- Task Priority Indicator -->
              <div class="flex items-start gap-2 mb-2">
                <div
                  class="w-1 h-full rounded-full flex-shrink-0 mt-1"
                  [class.bg-red-500]="task.priority === 'high'"
                  [class.bg-yellow-500]="task.priority === 'medium'"
                  [class.bg-green-500]="task.priority === 'low'">
                </div>

                <div class="flex-1 min-w-0">
                  <!-- Task Title -->
                  <h4 class="font-medium text-sm mb-1 break-words">{{ task.title }}</h4>

                  <!-- Task Description -->
                  @if (task.description) {
                    <p class="text-xs text-secondary line-clamp-2 mb-2">{{ task.description }}</p>
                  }

                  <!-- Task Tags -->
                  @if (task.tags.length > 0) {
                    <div class="flex flex-wrap gap-1 mb-2">
                      @for (tag of task.tags.slice(0, 3); track tag) {
                        <span
                          class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border border-color"
                          [style.background-color]="boardColor + '15'"
                          [style.color]="boardColor">
                          {{ tag }}
                        </span>
                      }
                      @if (task.tags.length > 3) {
                        <span class="text-xs text-secondary">+{{ task.tags.length - 3 }}</span>
                      }
                    </div>
                  }

                  <!-- Task Metadata -->
                  <div class="flex items-center justify-between text-xs text-secondary">
                    <div class="flex items-center gap-2">
                      @if (task.dueDate) {
                        <div class="flex items-center gap-1">
                          <span class="material-symbols-outlined text-sm">schedule</span>
                          <span>{{ task.dueDate | date: 'MMM d' }}</span>
                        </div>
                      }
                      <div
                        class="px-1.5 py-0.5 rounded text-xs capitalize"
                        [class.bg-blue-100]="task.status === 'todo'"
                        [class.text-blue-700]="task.status === 'todo'"
                        [class.bg-yellow-100]="task.status === 'in-progress'"
                        [class.text-yellow-700]="task.status === 'in-progress'"
                        [class.bg-green-100]="task.status === 'done'"
                        [class.text-green-700]="task.status === 'done'">
                        {{ task.status }}
                      </div>
                    </div>
                    <button
                      class="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-surface smooth-transition"
                      aria-label="Task options">
                      <span class="material-symbols-outlined text-sm">edit</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Drag Preview -->
              <div *cdkDragPreview class="task-card bg-background rounded-lg border border-color p-3 shadow-xl opacity-90">
                <h4 class="font-medium text-sm">{{ task.title }}</h4>
              </div>
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

  tasks = computed(() => {
    return this.boardService
      .tasks()
      .filter(t => t.listId === this.list.id)
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
      description: 'Click to edit task details',
      priority: 'medium',
      status: 'todo',
      tags: [],
      position: taskCount
    });
  }
}
