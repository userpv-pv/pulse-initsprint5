import { Component } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { MainCanvasComponent } from './components/main-canvas/main-canvas.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent, SidebarComponent, MainCanvasComponent],
  template: `
    <div class="h-screen flex flex-col overflow-hidden">
      <app-header />
      <div class="flex-1 flex overflow-hidden">
        <app-sidebar />
        <app-main-canvas />
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
