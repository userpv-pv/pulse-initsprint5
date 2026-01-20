export interface Board {
  id: string;
  name: string;
  color: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BoardCard {
  id: string;
  boardId: string;
  title: string;
  content: string;
  position: number;
  createdAt: Date;
}
