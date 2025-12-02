
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
  LEDGER = 'LEDGER',
  JOURNAL = 'JOURNAL',
}

export type FundType = 'FREEDOM' | 'DREAM' | 'PLAY';
export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL';

export interface Transaction {
  id: string;
  amount: number;
  fundType: FundType;
  type: TransactionType;
  description: string;
  date: number;
}

export interface DreamGoal {
  id: string;
  name: string;
  cost: number;
  isAchieved: boolean;
  achievedDate?: number;
}

export interface LedgerState {
  freedomFund: number;
  dreamFund: number;
  playFund: number;
  transactions: Transaction[];
  dreamGoals: DreamGoal[];
  percentages: {
    freedom: number;
    dream: number;
    play: number;
  };
}

export interface JournalEntry {
  id: string;
  timestamp: number;
  items: string[];
}
