import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  loadState,
  monthKey,
  getOrCreateMonth,
  calcBalance,
  calcDailyBudget,
  remainingDays,
  resolveCarryOver,
} from './storage';
import type { AppState, MonthData } from './types';

// ── helpers ────────────────────────────────────────────────────────────────

function makeMonth(overrides: Partial<MonthData> = {}): MonthData {
  return {
    year: 2026,
    month: 4, // Maio (0-based)
    transactions: [],
    carryOver: 0,
    ...overrides,
  };
}

function makeState(overrides: Partial<AppState> = {}): AppState {
  return { months: {}, carryOverEnabled: false, ...overrides };
}

// ── monthKey ───────────────────────────────────────────────────────────────

describe('monthKey', () => {
  it('formata janeiro corretamente', () => {
    expect(monthKey(2026, 0)).toBe('2026-01');
  });

  it('formata dezembro corretamente', () => {
    expect(monthKey(2025, 11)).toBe('2025-12');
  });

  it('preenche zero à esquerda em meses < 10', () => {
    expect(monthKey(2026, 4)).toBe('2026-05');
  });
});

// ── loadState ─────────────────────────────────────────────────────────────

describe('loadState', () => {
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
      removeItem: (k: string) => {
        delete store[k];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    localStorageMock.clear();
  });

  it('retorna estado padrão quando não há dados', () => {
    const state = loadState();
    expect(state.months).toEqual({});
    expect(state.carryOverEnabled).toBe(false);
  });

  it('retorna estado padrão quando JSON é inválido', () => {
    localStorageMock.setItem('financial-budget-v1', 'não-é-json');
    expect(loadState()).toEqual({ months: {}, carryOverEnabled: false });
  });

  it('retorna estado padrão quando estrutura é inválida (months ausente)', () => {
    localStorageMock.setItem(
      'financial-budget-v1',
      JSON.stringify({ foo: 'bar' }),
    );
    expect(loadState()).toEqual({ months: {}, carryOverEnabled: false });
  });

  it('retorna estado padrão quando months não é objeto', () => {
    localStorageMock.setItem(
      'financial-budget-v1',
      JSON.stringify({ months: 'invalido', carryOverEnabled: false }),
    );
    expect(loadState()).toEqual({ months: {}, carryOverEnabled: false });
  });

  it('carrega estado válido corretamente', () => {
    const valid: AppState = { months: {}, carryOverEnabled: true };
    localStorageMock.setItem('financial-budget-v1', JSON.stringify(valid));
    expect(loadState()).toEqual(valid);
  });
});

// ── calcBalance ────────────────────────────────────────────────────────────

describe('calcBalance', () => {
  it('retorna carryOver quando não há transações', () => {
    expect(calcBalance(makeMonth({ carryOver: 500 }))).toBe(500);
  });

  it('soma entradas ao saldo', () => {
    const data = makeMonth({
      transactions: [
        {
          id: '1',
          description: 'Salário',
          amount: 3000,
          type: 'income',
          date: '2026-05-01',
        },
      ],
    });
    expect(calcBalance(data)).toBe(3000);
  });

  it('subtrai saídas do saldo', () => {
    const data = makeMonth({
      transactions: [
        {
          id: '1',
          description: 'Aluguel',
          amount: 1200,
          type: 'expense',
          date: '2026-05-01',
        },
      ],
    });
    expect(calcBalance(data)).toBe(-1200);
  });

  it('combina carryOver + entradas - saídas', () => {
    const data = makeMonth({
      carryOver: 500,
      transactions: [
        {
          id: '1',
          description: 'Salário',
          amount: 3000,
          type: 'income',
          date: '2026-05-01',
        },
        {
          id: '2',
          description: 'Aluguel',
          amount: 1200,
          type: 'expense',
          date: '2026-05-02',
        },
      ],
    });
    expect(calcBalance(data)).toBe(2300); // 500 + 3000 - 1200
  });
});

// ── resolveCarryOver ───────────────────────────────────────────────────────

describe('resolveCarryOver', () => {
  it('retorna 0 quando carryOver está desabilitado', () => {
    const state = makeState({ carryOverEnabled: false });
    expect(resolveCarryOver(state, 2026, 4)).toBe(0);
  });

  it('retorna 0 quando mês anterior não existe', () => {
    const state = makeState({ carryOverEnabled: true });
    expect(resolveCarryOver(state, 2026, 4)).toBe(0);
  });

  it('retorna saldo do mês anterior quando habilitado', () => {
    const prevMonth = makeMonth({
      year: 2026,
      month: 3,
      transactions: [
        {
          id: '1',
          description: 'Salário',
          amount: 3000,
          type: 'income',
          date: '2026-04-01',
        },
        {
          id: '2',
          description: 'Despesa',
          amount: 800,
          type: 'expense',
          date: '2026-04-02',
        },
      ],
    });
    const state = makeState({
      carryOverEnabled: true,
      months: { '2026-04': prevMonth },
    });
    expect(resolveCarryOver(state, 2026, 4)).toBe(2200); // 3000 - 800
  });

  it('navega corretamente pela virada de ano (janeiro → dezembro anterior)', () => {
    const prevMonth = makeMonth({
      year: 2025,
      month: 11,
      transactions: [
        {
          id: '1',
          description: 'Bonus',
          amount: 1000,
          type: 'income',
          date: '2025-12-01',
        },
      ],
    });
    const state = makeState({
      carryOverEnabled: true,
      months: { '2025-12': prevMonth },
    });
    expect(resolveCarryOver(state, 2026, 0)).toBe(1000);
  });
});

// ── remainingDays ──────────────────────────────────────────────────────────

describe('remainingDays', () => {
  it('retorna 0 para mês passado', () => {
    // Maio 2026 é o mês atual; Abril 2026 é passado
    vi.setSystemTime(new Date(2026, 4, 14));
    expect(remainingDays(2026, 3)).toBe(0);
    vi.useRealTimers();
  });

  it('retorna total de dias para mês futuro', () => {
    vi.setSystemTime(new Date(2026, 4, 14));
    expect(remainingDays(2026, 5)).toBe(30); // junho tem 30 dias
    vi.useRealTimers();
  });

  it('retorna dias restantes para mês atual', () => {
    vi.setSystemTime(new Date(2026, 4, 14));
    // Maio tem 31 dias; 14 de maio → restam 31 - 14 + 1 = 18
    expect(remainingDays(2026, 4)).toBe(18);
    vi.useRealTimers();
  });
});

// ── calcDailyBudget ────────────────────────────────────────────────────────

describe('calcDailyBudget', () => {
  afterEach(() => vi.useRealTimers());

  it('retorna 0 para mês passado', () => {
    vi.setSystemTime(new Date(2026, 4, 14));
    expect(calcDailyBudget(3000, 2026, 3)).toBe(0);
  });

  it('divide saldo pelos dias restantes', () => {
    vi.setSystemTime(new Date(2026, 4, 14));
    // 18 dias restantes em maio 2026
    expect(calcDailyBudget(1800, 2026, 4)).toBeCloseTo(100);
  });
});

// ── getOrCreateMonth ───────────────────────────────────────────────────────

describe('getOrCreateMonth', () => {
  it('retorna mês existente', () => {
    const existing = makeMonth({ carryOver: 99 });
    const state = makeState({ months: { '2026-05': existing } });
    expect(getOrCreateMonth(state, 2026, 4)).toBe(existing);
  });

  it('cria novo mês quando não existe', () => {
    const state = makeState();
    const month = getOrCreateMonth(state, 2026, 4);
    expect(month).toEqual({
      year: 2026,
      month: 4,
      transactions: [],
      carryOver: 0,
    });
  });
});
