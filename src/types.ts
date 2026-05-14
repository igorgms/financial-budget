export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: string; // ISO string
}

export interface MonthData {
  year: number;
  month: number; // 0-based (0 = Jan)
  transactions: Transaction[];
  carryOver: number; // valor trazido do mês anterior
}

export interface AppState {
  months: Record<string, MonthData>; // key: "YYYY-MM"
  carryOverEnabled: boolean;
}
