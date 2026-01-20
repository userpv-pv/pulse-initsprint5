import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardService } from '../../services/board.service';

@Component({
  selector: 'app-main-canvas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="flex-1 overflow-y-auto p-8">
      <div class="max-w-7xl mx-auto">
        <div class="mb-8">
          <h2 class="text-3xl font-bold mb-2">Welcome to Pulse</h2>
          <p class="text-secondary">Organize your work with beautiful boards</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (board of boardService.getBoards(); track board.id) {
            <article
              class="bg-surface rounded-xl p-6 border border-color hover:shadow-lg smooth-transition cursor-pointer">
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-12 h-12 rounded-lg flex items-center justify-center"
                    [style.background-color]="board.color">
                    <span class="material-symbols-outlined text-white text-2xl">dashboard</span>
                  </div>
                  <div>
                    <h3 class="font-semibold text-lg">{{ board.name }}</h3>
                    <p class="text-sm text-secondary">{{ board.updatedAt | date: 'MMM d, y' }}</p>
                  </div>
                </div>
                <button class="p-1 rounded hover:bg-surface smooth-transition">
                  <span class="material-symbols-outlined text-xl text-secondary">more_vert</span>
                </button>
              </div>

              @if (board.description) {
                <p class="text-secondary mb-4">{{ board.description }}</p>
              }

              <div class="flex items-center justify-between pt-4 border-t border-color">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-sm text-secondary">check_circle</span>
                  <span class="text-sm text-secondary">0 tasks</span>
                </div>
                <div class="flex -space-x-2">
                  @for (i of [1, 2, 3]; track i) {
                    <div
                      class="w-8 h-8 rounded-full border-2 border-color flex items-center justify-center text-xs font-medium"
                      [style.background-color]="board.color">
                      {{ 'ABCDEFG'[i] }}
                    </div>
                  }
                </div>
              </div>
            </article>
          }

          <button
            class="bg-surface rounded-xl p-6 border-2 border-dashed border-color hover:border-primary smooth-transition cursor-pointer flex flex-col items-center justify-center min-h-[240px] group">
            <div class="w-16 h-16 rounded-full bg-surface border border-color flex items-center justify-center mb-4 group-hover:border-primary smooth-transition">
              <span class="material-symbols-outlined text-3xl text-secondary group-hover:text-primary smooth-transition">add</span>
            </div>
            <h3 class="font-semibold mb-1">Create New Board</h3>
            <p class="text-sm text-secondary">Start organizing your work</p>
          </button>
        </div>

        <div class="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section class="bg-surface rounded-xl p-6 border border-color">
            <h3 class="font-semibold text-lg mb-4">Recent Activity</h3>
            <div class="space-y-4">
              @for (i of [1, 2, 3]; track i) {
                <div class="flex items-start gap-3 pb-4 border-b border-color last:border-0 last:pb-0">
                  <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <span class="material-symbols-outlined text-white text-sm">person</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm"><strong>User {{ i }}</strong> updated a card</p>
                    <p class="text-xs text-secondary mt-1">{{ i }} hours ago</p>
                  </div>
                </div>
              }
            </div>
          </section>

          <section class="bg-surface rounded-xl p-6 border border-color">
            <h3 class="font-semibold text-lg mb-4">Quick Stats</h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="text-center p-4 bg-surface rounded-lg border border-color">
                <div class="text-3xl font-bold text-primary mb-1">{{ boardService.getBoards().length }}</div>
                <div class="text-sm text-secondary">Active Boards</div>
              </div>
              <div class="text-center p-4 bg-surface rounded-lg border border-color">
                <div class="text-3xl font-bold text-secondary mb-1">0</div>
                <div class="text-sm text-secondary">Total Tasks</div>
              </div>
              <div class="text-center p-4 bg-surface rounded-lg border border-color">
                <div class="text-3xl font-bold text-accent mb-1">0</div>
                <div class="text-sm text-secondary">Completed</div>
              </div>
              <div class="text-center p-4 bg-surface rounded-lg border border-color">
                <div class="text-3xl font-bold text-primary mb-1">100%</div>
                <div class="text-sm text-secondary">Progress</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
  `]
})
export class MainCanvasComponent {
  boardService = inject(BoardService);
}
