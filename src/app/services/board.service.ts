import { Injectable, signal } from '@angular/core';
import { Board } from '../models/board.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  private boards = signal<Board[]>([
    {
      id: uuidv4(),
      name: 'Product Roadmap',
      color: '#3b82f6',
      description: 'Q1 2024 product planning and features',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20')
    },
    {
      id: uuidv4(),
      name: 'Marketing Campaign',
      color: '#8b5cf6',
      description: 'Launch campaign for new product line',
      createdAt: new Date('2024-01-18'),
      updatedAt: new Date('2024-01-22')
    },
    {
      id: uuidv4(),
      name: 'Design System',
      color: '#ec4899',
      description: 'Component library and design tokens',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-25')
    }
  ]);

  getBoards = this.boards.asReadonly();

  addBoard(board: Omit<Board, 'id' | 'createdAt' | 'updatedAt'>) {
    const newBoard: Board = {
      ...board,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.boards.update(boards => [...boards, newBoard]);
  }

  updateBoard(id: string, updates: Partial<Board>) {
    this.boards.update(boards =>
      boards.map(board =>
        board.id === id
          ? { ...board, ...updates, updatedAt: new Date() }
          : board
      )
    );
  }

  deleteBoard(id: string) {
    this.boards.update(boards => boards.filter(board => board.id !== id));
  }

  getBoardById(id: string): Board | undefined {
    return this.boards().find(board => board.id === id);
  }
}
