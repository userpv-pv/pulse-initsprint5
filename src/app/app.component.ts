import { Component } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { BoardListSidebarComponent } from './components/board-list-sidebar/board-list-sidebar.component';
import { MainCanvasComponent } from './components/main-canvas/main-canvas.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent, BoardListSidebarComponent, MainCanvasComponent],
  template: `
    <div class="h-screen flex flex-col overflow-hidden">
      <app-header />
      <div class="flex-1 flex overflow-hidden">
        <app-board-list-sidebar />
        <div class="flex-1 md:ml-64">
          <app-main-canvas />
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
  `]
})
export class AppComponent {}
