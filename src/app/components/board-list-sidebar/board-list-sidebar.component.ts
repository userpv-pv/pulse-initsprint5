import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BoardService } from '../../services/board.service';
import { AddBoardDialogComponent } from './add-board-dialog.component';

@Component({
  selector: 'app-board-list-sidebar',
  standalone: true,
  imports: [CommonModule, DragDropModule, MatDialogModule],
  template: `
    <aside
      class="fixed inset-y-0 left-0 z-40 transition-transform duration-300 ease-in-out"
      [class.translate-x-0]="isOpen()"
      [class.-translate-x-full]="!isOpen()"
      [class.md:translate-x-0]="true">

      <div class="w-64 h-full bg-surface border-r border-color smooth-transition flex flex-col">

        <!-- Header with Close Button (Mobile) -->
        <div class="flex items-center justify-between p-6 border-b border-color md:border-0">
          <h2 class="text-lg font-semibold">Boards</h2>
          <button
            class="md:hidden p-1.5 rounded-lg hover:bg-surface smooth-transition border border-color"
            (click)="toggleSidebar()"
            aria-label="Close sidebar">
            <span class="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <!-- Add New Board Button -->
        <div class="px-6 pb-4">
          <button
            (click)="openAddBoardDialog()"
            class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-white hover:opacity-90 smooth-transition font-medium">
            <span class="material-symbols-outlined text-xl">add</span>
            <span>New Board</span>
          </button>
        </div>

        <!-- Boards List with Drag & Drop -->
        <nav
          class="flex-1 overflow-y-auto px-6 pb-6"
          cdkDropList
          (cdkDropListDropped)="onBoardDrop($event)">

          <div class="space-y-2">
            @for (board of boardService.boards(); track board.id; let idx = $index) {
              <button
                cdkDrag
                [cdkDragData]="board"
                [attr.data-board-index]="idx"
                (click)="selectBoard(board.id)"
                (keydown)="onKeyDown($event, idx)"
                class="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-surface smooth-transition text-left border border-color relative group"
                [class.ring-2]="boardService.activeBoardId() === board.id"
                [class.ring-primary]="boardService.activeBoardId() === board.id"
                [class.bg-surface]="boardService.activeBoardId() === board.id">

                <!-- Drag Handle -->
                <div
                  cdkDragHandle
                  class="opacity-0 group-hover:opacity-100 smooth-transition cursor-move">
                  <span class="material-symbols-outlined text-lg text-secondary">drag_indicator</span>
                </div>

                <!-- Board Color Indicator -->
                <div
                  class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br"
                  [style.background]="'linear-gradient(135deg, ' + board.color + ' 0%, ' + adjustColor(board.color, -20) + ' 100%)'">
                  <span class="material-symbols-outlined text-white text-xl">dashboard</span>
                </div>

                <!-- Board Info -->
                <div class="flex-1 min-w-0">
                  <div class="font-medium truncate">{{ board.name }}</div>
                  @if (board.description) {
                    <div class="text-sm text-secondary truncate">{{ board.description }}</div>
                  }
                </div>

                <!-- Active Indicator -->
                @if (boardService.activeBoardId() === board.id) {
                  <div class="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                }
              </button>
            }
          </div>

          @if (boardService.boards().length === 0) {
            <div class="text-center py-8 text-secondary">
              <span class="material-symbols-outlined text-4xl mb-2 block">dashboard</span>
              <p>No boards yet</p>
              <p class="text-sm mt-1">Create your first board</p>
            </div>
          }
        </nav>

        <!-- Workspace Section -->
        <div class="border-t border-color p-6">
          <h3 class="text-sm font-semibold mb-3 text-secondary">WORKSPACE</h3>
          <nav class="space-y-1">
            <button class="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-surface smooth-transition text-left">
              <span class="material-symbols-outlined text-xl">settings</span>
              <span>Settings</span>
            </button>
            <button class="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-surface smooth-transition text-left">
              <span class="material-symbols-outlined text-xl">group</span>
              <span>Members</span>
            </button>
            <button class="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-surface smooth-transition text-left">
              <span class="material-symbols-outlined text-xl">insights</span>
              <span>Analytics</span>
            </button>
          </nav>
        </div>
      </div>
    </aside>

    <!-- Mobile Overlay -->
    @if (isOpen()) {
      <div
        class="fixed inset-0 bg-black/50 z-30 md:hidden smooth-transition"
        (click)="closeSidebar()"
        aria-hidden="true">
      </div>
    }

    <!-- Mobile Toggle Button -->
    <button
      class="fixed top-20 left-4 z-50 md:hidden p-3 rounded-lg bg-primary text-white shadow-lg smooth-transition"
      [class.left-72]="isOpen()"
      (click)="toggleSidebar()"
      aria-label="Toggle sidebar">
      <span class="material-symbols-outlined text-xl">
        {{ isOpen() ? 'close' : 'menu' }}
      </span>
    </button>
  `,
  styles: [`
    :host {
      display: contents;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    .cdk-drag-preview {
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
      opacity: 0.8;
    }

    .cdk-drag-placeholder {
      opacity: 0.3;
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `]
})
export class BoardListSidebarComponent {
  boardService = inject(BoardService);
  private dialog = inject(MatDialog);

  isOpen = signal(false);

  selectBoard(boardId: string) {
    this.boardService.setActiveBoardId(boardId);
    if (window.innerWidth < 768) {
      this.closeSidebar();
    }
  }

  openAddBoardDialog() {
    this.dialog.open(AddBoardDialogComponent, {
      width: '500px',
      maxWidth: '90vw',
      panelClass: 'custom-dialog'
    });
  }

  onBoardDrop(event: CdkDragDrop<any>) {
    const boards = [...this.boardService.boards()];
    moveItemInArray(boards, event.previousIndex, event.currentIndex);

    boards.forEach((board, index) => {
      this.boardService.updateBoard(board.id, {
        updatedAt: new Date()
      });
    });
  }

  onKeyDown(event: KeyboardEvent, currentIndex: number) {
    const boards = this.boardService.boards();
    let nextIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        nextIndex = Math.min(currentIndex + 1, boards.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        nextIndex = Math.max(currentIndex - 1, 0);
        break;
      case 'Home':
        event.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        nextIndex = boards.length - 1;
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.selectBoard(boards[currentIndex].id);
        return;
      default:
        return;
    }

    if (nextIndex !== currentIndex) {
      const nextButton = document.querySelector(`[data-board-index="${nextIndex}"]`) as HTMLButtonElement;
      nextButton?.focus();
    }
  }

  toggleSidebar() {
    this.isOpen.update(open => !open);
  }

  closeSidebar() {
    this.isOpen.set(false);
  }

  adjustColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, Math.min(255, (num >> 16) + amt));
    const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt));
    const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
    return '#' + (0x1000000 + (R * 0x10000) + (G * 0x100) + B).toString(16).slice(1);
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (window.innerWidth >= 768) {
      this.isOpen.set(false);
    }
  }
}
