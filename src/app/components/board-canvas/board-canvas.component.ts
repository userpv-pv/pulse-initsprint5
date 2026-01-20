import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BoardService } from '../../services/board.service';
import { TaskListComponent } from './task-list.component';

@Component({
  selector: 'app-board-canvas',
  standalone: true,
  imports: [CommonModule, FormsModule, TaskListComponent],
  template: `
    <main class="flex-1 overflow-hidden flex flex-col bg-gradient-to-br from-background to-surface">

      @if (isLoading()) {
        <div class="flex-1 flex items-center justify-center">
          <div class="text-center">
            <div class="spinner mb-4"></div>
            <p class="text-secondary">Loading board...</p>
          </div>
        </div>
      } @else if (!activeBoard()) {
        <div class="flex-1 flex items-center justify-center p-8">
          <div class="text-center max-w-md">
            <div class="w-20 h-20 rounded-full bg-surface border border-color flex items-center justify-center mx-auto mb-6">
              <span class="material-symbols-outlined text-4xl text-secondary">dashboard</span>
            </div>
            <h2 class="text-2xl font-bold mb-3">No Board Selected</h2>
            <p class="text-secondary mb-6">Select a board from the sidebar or create a new one to get started.</p>
            <button
              class="px-6 py-3 rounded-lg bg-primary text-white hover:opacity-90 smooth-transition font-medium flex items-center gap-2 mx-auto">
              <span class="material-symbols-outlined">add</span>
              <span>Create Your First Board</span>
            </button>
          </div>
        </div>
      } @else {
        <!-- Board Header -->
        <div class="border-b border-color bg-surface px-6 py-4 flex-shrink-0">
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div
                class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br shadow-sm"
                [style.background]="'linear-gradient(135deg, ' + activeBoard()!.color + ' 0%, ' + adjustColor(activeBoard()!.color, -20) + ' 100%)'">
                <span class="material-symbols-outlined text-white text-2xl">dashboard</span>
              </div>
              <div class="flex-1 min-w-0">
                <h1 class="text-2xl font-bold truncate">{{ activeBoard()!.name }}</h1>
                @if (activeBoard()!.description) {
                  <p class="text-sm text-secondary truncate">{{ activeBoard()!.description }}</p>
                }
              </div>
            </div>

            <!-- Board Actions -->
            <div class="flex items-center gap-2">
              <div class="relative">
                <input
                  type="text"
                  [(ngModel)]="searchQuery"
                  (ngModelChange)="onSearchChange($event)"
                  placeholder="Search tasks..."
                  class="w-64 px-4 py-2 pl-10 rounded-lg border border-color bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none smooth-transition text-sm">
                <span class="material-symbols-outlined absolute left-3 top-2.5 text-secondary text-lg">search</span>
              </div>
              <button
                class="p-2 rounded-lg hover:bg-surface smooth-transition border border-color"
                aria-label="Filter tasks">
                <span class="material-symbols-outlined text-xl">filter_list</span>
              </button>
              <button
                class="p-2 rounded-lg hover:bg-surface smooth-transition border border-color"
                aria-label="Board settings">
                <span class="material-symbols-outlined text-xl">settings</span>
              </button>
            </div>
          </div>

          <!-- Board Stats -->
          <div class="flex items-center gap-6 mt-4">
            <div class="flex items-center gap-2 text-sm">
              <span class="material-symbols-outlined text-lg text-secondary">view_column</span>
              <span class="text-secondary">{{ lists().length }} Lists</span>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <span class="material-symbols-outlined text-lg text-secondary">task</span>
              <span class="text-secondary">{{ totalTasks() }} Tasks</span>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <span class="material-symbols-outlined text-lg text-green-500">check_circle</span>
              <span class="text-secondary">{{ completedTasks() }} Completed</span>
            </div>
            @if (totalTasks() > 0) {
              <div class="flex items-center gap-2 text-sm">
                <div class="w-32 h-2 bg-surface rounded-full overflow-hidden border border-color">
                  <div
                    class="h-full bg-gradient-to-r from-green-400 to-green-600 smooth-transition"
                    [style.width.%]="(completedTasks() / totalTasks()) * 100">
                  </div>
                </div>
                <span class="text-secondary">{{ ((completedTasks() / totalTasks()) * 100).toFixed(0) }}%</span>
              </div>
            }
          </div>
        </div>

        <!-- Lists Container -->
        <div class="flex-1 overflow-x-auto overflow-y-hidden p-6">
          <div class="flex gap-4 h-full md:flex-row flex-col min-w-min">

            <!-- Existing Lists -->
            @for (list of lists(); track list.id) {
              <app-task-list
                [list]="list"
                [boardColor]="activeBoard()!.color"
                [connectedLists]="listIds()">
              </app-task-list>
            }

            <!-- Add New List -->
            <div class="flex-shrink-0 w-80 max-w-full">
              @if (isAddingList()) {
                <div class="bg-surface rounded-xl border border-color shadow-sm p-4">
                  <input
                    type="text"
                    [(ngModel)]="newListName"
                    (keydown.enter)="createList()"
                    (keydown.escape)="cancelAddList()"
                    placeholder="Enter list name..."
                    class="w-full px-3 py-2 rounded-lg border border-color bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none smooth-transition mb-3"
                    autofocus>
                  <div class="flex items-center gap-2">
                    <button
                      (click)="createList()"
                      class="flex-1 px-3 py-2 rounded-lg bg-primary text-white hover:opacity-90 smooth-transition font-medium text-sm">
                      Add List
                    </button>
                    <button
                      (click)="cancelAddList()"
                      class="p-2 rounded-lg hover:bg-surface smooth-transition border border-color">
                      <span class="material-symbols-outlined text-xl">close</span>
                    </button>
                  </div>
                </div>
              } @else {
                <button
                  (click)="startAddList()"
                  class="w-full h-full min-h-[120px] bg-surface/50 hover:bg-surface rounded-xl border-2 border-dashed border-color hover:border-primary smooth-transition flex flex-col items-center justify-center gap-3 group">
                  <div class="w-12 h-12 rounded-full bg-surface border border-color flex items-center justify-center group-hover:border-primary smooth-transition">
                    <span class="material-symbols-outlined text-2xl text-secondary group-hover:text-primary smooth-transition">add</span>
                  </div>
                  <span class="font-medium text-secondary group-hover:text-primary smooth-transition">Add New List</span>
                </button>
              }
            </div>
          </div>
        </div>
      }
    </main>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid rgb(var(--color-border));
      border-top-color: rgb(var(--color-primary));
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .flex-col app-task-list {
        width: 100%;
        height: auto;
      }
    }

    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
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

    ::-webkit-scrollbar-corner {
      background: transparent;
    }
  `]
})
export class BoardCanvasComponent {
  private boardService = inject(BoardService);

  isLoading = signal(true);
  isAddingList = signal(false);
  newListName = signal('');
  searchQuery = '';

  activeBoard = this.boardService.activeBoard;

  lists = computed(() => {
    const boardId = this.boardService.activeBoardId();
    if (!boardId) return [];

    return this.boardService
      .lists()
      .filter(l => l.boardId === boardId)
      .sort((a, b) => a.position - b.position);
  });

  listIds = computed(() => this.lists().map(l => l.id));

  totalTasks = computed(() => {
    const boardId = this.boardService.activeBoardId();
    if (!boardId) return 0;
    return this.boardService.tasks().filter(t => t.boardId === boardId).length;
  });

  completedTasks = computed(() => {
    const boardId = this.boardService.activeBoardId();
    if (!boardId) return 0;
    return this.boardService.tasks().filter(t => t.boardId === boardId && t.status === 'done').length;
  });

  constructor() {
    setTimeout(() => this.isLoading.set(false), 500);
  }

  startAddList() {
    this.isAddingList.set(true);
    this.newListName.set('');
  }

  cancelAddList() {
    this.isAddingList.set(false);
    this.newListName.set('');
  }

  createList() {
    const name = this.newListName().trim();
    if (!name) return;

    const board = this.activeBoard();
    if (!board) return;

    const position = this.lists().length;

    this.boardService.addList({
      boardId: board.id,
      name,
      position
    });

    this.cancelAddList();
  }

  onSearchChange(query: string) {
    this.boardService.setSearchQuery(query);
  }

  adjustColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, Math.min(255, (num >> 16) + amt));
    const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt));
    const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
    return '#' + (0x1000000 + (R * 0x10000) + (G * 0x100) + B).toString(16).slice(1);
  }
}
