import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardService } from '../../services/board.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="w-64 bg-surface border-r border-color smooth-transition h-full overflow-y-auto">
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold">Boards</h2>
          <button
            class="p-1.5 rounded-lg hover:bg-surface smooth-transition border border-color"
            (click)="addNewBoard()">
            <span class="material-symbols-outlined text-xl">add</span>
          </button>
        </div>

        <nav class="space-y-2">
          @for (board of boardService.getBoards(); track board.id) {
            <button
              class="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-surface smooth-transition text-left border border-color"
              [class.bg-surface]="selectedBoardId === board.id">
              <div
                class="w-4 h-4 rounded-full flex-shrink-0"
                [style.background-color]="board.color">
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-medium truncate">{{ board.name }}</div>
                @if (board.description) {
                  <div class="text-sm text-secondary truncate">{{ board.description }}</div>
                }
              </div>
            </button>
          }
        </nav>

        <div class="mt-8 pt-8 border-t border-color">
          <h3 class="text-sm font-semibold mb-4 text-secondary">WORKSPACE</h3>
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
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
  `]
})
export class SidebarComponent {
  boardService = inject(BoardService);
  selectedBoardId: string | null = null;

  addNewBoard() {
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    this.boardService.addBoard({
      name: 'New Board',
      color: randomColor,
      description: 'Click to edit description'
    });
  }
}
