import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { BoardService } from '../../services/board.service';

interface ColorOption {
  name: string;
  value: string;
  gradient: string;
}

@Component({
  selector: 'app-add-board-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  template: `
    <div class="bg-surface rounded-xl overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-color">
        <h2 class="text-2xl font-bold">Create New Board</h2>
        <button
          (click)="close()"
          class="p-2 rounded-lg hover:bg-surface smooth-transition border border-color"
          aria-label="Close dialog">
          <span class="material-symbols-outlined text-xl">close</span>
        </button>
      </div>

      <!-- Form -->
      <form (ngSubmit)="createBoard()" class="p-6 space-y-6">
        <!-- Board Name -->
        <div>
          <label for="board-name" class="block text-sm font-medium mb-2">
            Board Name <span class="text-primary">*</span>
          </label>
          <input
            id="board-name"
            type="text"
            [(ngModel)]="boardName"
            name="boardName"
            required
            placeholder="e.g., Product Roadmap, Marketing Campaign"
            class="w-full px-4 py-3 rounded-lg border border-color bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none smooth-transition"
            autofocus>
        </div>

        <!-- Board Description -->
        <div>
          <label for="board-description" class="block text-sm font-medium mb-2">
            Description (Optional)
          </label>
          <textarea
            id="board-description"
            [(ngModel)]="boardDescription"
            name="boardDescription"
            rows="3"
            placeholder="Brief description of what this board is for..."
            class="w-full px-4 py-3 rounded-lg border border-color bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none smooth-transition resize-none">
          </textarea>
        </div>

        <!-- Color Selection -->
        <div>
          <label class="block text-sm font-medium mb-3">
            Board Color <span class="text-primary">*</span>
          </label>
          <div class="grid grid-cols-4 gap-3">
            @for (color of colorOptions; track color.value) {
              <button
                type="button"
                (click)="selectColor(color.value)"
                class="aspect-square rounded-lg border-2 smooth-transition hover:scale-105 active:scale-95 relative overflow-hidden"
                [class.border-primary]="selectedColor === color.value"
                [class.border-color]="selectedColor !== color.value"
                [class.ring-2]="selectedColor === color.value"
                [class.ring-primary]="selectedColor === color.value"
                [style.background]="color.gradient"
                [attr.aria-label]="'Select ' + color.name + ' color'">

                @if (selectedColor === color.value) {
                  <span class="absolute inset-0 flex items-center justify-center">
                    <span class="material-symbols-outlined text-white text-2xl drop-shadow-lg">
                      check_circle
                    </span>
                  </span>
                }
              </button>
            }
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-color">
          <button
            type="button"
            (click)="close()"
            class="px-6 py-2.5 rounded-lg border border-color hover:bg-surface smooth-transition font-medium">
            Cancel
          </button>
          <button
            type="submit"
            [disabled]="!boardName.trim() || !selectedColor"
            class="px-6 py-2.5 rounded-lg bg-primary text-white hover:opacity-90 smooth-transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            <span class="material-symbols-outlined text-xl">add</span>
            <span>Create Board</span>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AddBoardDialogComponent {
  private dialogRef = inject(MatDialogRef<AddBoardDialogComponent>);
  private boardService = inject(BoardService);

  boardName = '';
  boardDescription = '';
  selectedColor = '#3b82f6';

  colorOptions: ColorOption[] = [
    {
      name: 'Blue',
      value: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)'
    },
    {
      name: 'Purple',
      value: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)'
    },
    {
      name: 'Pink',
      value: '#ec4899',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)'
    },
    {
      name: 'Indigo',
      value: '#6366f1',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)'
    },
    {
      name: 'Green',
      value: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)'
    },
    {
      name: 'Teal',
      value: '#14b8a6',
      gradient: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)'
    },
    {
      name: 'Orange',
      value: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    },
    {
      name: 'Red',
      value: '#ef4444',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
    },
    {
      name: 'Cyan',
      value: '#06b6d4',
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
    },
    {
      name: 'Emerald',
      value: '#059669',
      gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
    },
    {
      name: 'Amber',
      value: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)'
    },
    {
      name: 'Rose',
      value: '#f43f5e',
      gradient: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)'
    }
  ];

  selectColor(color: string) {
    this.selectedColor = color;
  }

  createBoard() {
    if (!this.boardName.trim() || !this.selectedColor) {
      return;
    }

    const newBoard = this.boardService.addBoard({
      name: this.boardName.trim(),
      color: this.selectedColor,
      description: this.boardDescription.trim() || undefined
    });

    this.boardService.setActiveBoardId(newBoard.id);

    this.dialogRef.close(newBoard);
  }

  close() {
    this.dialogRef.close();
  }
}
