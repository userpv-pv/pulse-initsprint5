import { Component } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { BoardListSidebarComponent } from './components/board-list-sidebar/board-list-sidebar.component';
import { BoardCanvasComponent } from './components/board-canvas/board-canvas.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent, BoardListSidebarComponent, BoardCanvasComponent],
  template: `
    <div class="h-screen flex flex-col overflow-hidden">
      <app-header />
      <div class="flex-1 flex overflow-hidden">
        <app-board-list-sidebar />
        <div class="flex-1 md:ml-64">
          <app-board-canvas />
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
