import type { AppState, MonthData } from './types';

const STORAGE_KEY = 'financial-budget-v1';

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return JSON.parse(raw) as AppState;
  } catch {
    return defaultState();
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function defaultState(): AppState {
  return { months: {}, carryOverEnabled: false };
}

export function monthKey(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

export function getOrCreateMonth(state: AppState, year: number, month: number): MonthData {
  const key = monthKey(year, month);
  if (state.months[key]) return state.months[key];
  return { year, month, transactions: [], carryOver: 0 };
}

/** Calcula saldo do mês: carryOver + entradas - saídas */
export function calcBalance(data: MonthData): number {
  const txTotal = data.transactions.reduce((acc, t) => {
    return t.type === 'income' ? acc + t.amount : acc - t.amount;
  }, 0);
  return data.carryOver + txTotal;
}

/** Dias restantes no mês (incluindo hoje) */
export function remainingDays(year: number, month: number): number {
  const today = new Date();
  const lastDay = new Date(year, month + 1, 0).getDate();
  if (today.getFullYear() === year && today.getMonth() === month) {
    return lastDay - today.getDate() + 1;
  }
  // mês futuro: dias totais
  if (new Date(year, month, 1) > today) return lastDay;
  // mês passado
  return 0;
}

/** Quanto pode gastar por dia até o fim do mês */
export function calcDailyBudget(balance: number, year: number, month: number): number {
  const days = remainingDays(year, month);
  if (days <= 0) return 0;
  return balance / days;
}
