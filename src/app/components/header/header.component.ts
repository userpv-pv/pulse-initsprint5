import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="bg-surface border-b border-color smooth-transition">
      <div class="flex items-center justify-between px-6 py-4">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span class="material-symbols-outlined text-white text-2xl">dashboard</span>
            </div>
            <h1 class="text-2xl font-bold tracking-tight">Pulse</h1>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <button
            (click)="toggleTheme()"
            class="p-2 rounded-lg hover:bg-surface smooth-transition border border-color"
            [attr.aria-label]="themeService.theme() === 'light' ? 'Switch to dark mode' : 'Switch to light mode'">
            <span class="material-symbols-outlined text-xl">
              {{ themeService.theme() === 'light' ? 'dark_mode' : 'light_mode' }}
            </span>
          </button>

          <button class="p-2 rounded-lg hover:bg-surface smooth-transition border border-color">
            <span class="material-symbols-outlined text-xl">notifications</span>
          </button>

          <button class="p-2 rounded-lg hover:bg-surface smooth-transition border border-color">
            <span class="material-symbols-outlined text-xl">account_circle</span>
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class HeaderComponent {
  themeService = inject(ThemeService);

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
