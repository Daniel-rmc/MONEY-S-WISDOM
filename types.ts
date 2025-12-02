export interface Quote {
  id: string;
  text: string;
  category: string;
  interpretation: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum ViewState {
  WALL = 'WALL',
  CHAT = 'CHAT',
}
