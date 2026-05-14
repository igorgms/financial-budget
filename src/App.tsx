import { useState, useEffect } from 'react';
import type { AppState, Transaction, TransactionType } from './types';
import {
  loadState,
  saveState,
  monthKey,
  getOrCreateMonth,
  calcBalance,
  calcDailyBudget,
  remainingDays,
  resolveCarryOver,
} from './storage';
import { MonthNavigator } from './components/MonthNavigator';
import { Summary } from './components/Summary';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import './App.css';

function App() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [appState, setAppState] = useState<AppState>(loadState);

  useEffect(() => {
    saveState(appState);
  }, [appState]);

  const monthData = getOrCreateMonth(appState, year, month);

  function addTransaction(
    description: string,
    amount: number,
    type: TransactionType,
    date: string,
  ) {
    const tx: Transaction = {
      id: crypto.randomUUID(),
      description,
      amount,
      type,
      date,
    };
    setAppState((prev) => {
      const key = monthKey(year, month);
      const existing = getOrCreateMonth(prev, year, month);
      const carryOver = resolveCarryOver(prev, year, month);
      const updated = {
        ...existing,
        transactions: [...existing.transactions, tx],
        carryOver,
      };
      return { ...prev, months: { ...prev.months, [key]: updated } };
    });
  }

  function removeTransaction(id: string) {
    setAppState((prev) => {
      const key = monthKey(year, month);
      const existing = getOrCreateMonth(prev, year, month);
      const updated = {
        ...existing,
        transactions: existing.transactions.filter((t) => t.id !== id),
      };
      return { ...prev, months: { ...prev.months, [key]: updated } };
    });
  }

  function toggleCarryOver() {
    setAppState((prev) => {
      const key = monthKey(year, month);
      const enabled = !prev.carryOverEnabled;
      const existing = getOrCreateMonth(prev, year, month);
      const newCarryOver = enabled
        ? resolveCarryOver({ ...prev, carryOverEnabled: enabled }, year, month)
        : 0;
      const updated = { ...existing, carryOver: newCarryOver };
      return {
        ...prev,
        carryOverEnabled: enabled,
        months: { ...prev.months, [key]: updated },
      };
    });
  }

  function handleMonthChange(y: number, m: number) {
    setYear(y);
    setMonth(m);
    setAppState((prev) => {
      const newKey = monthKey(y, m);
      const existing = getOrCreateMonth(prev, y, m);
      const carryOver = resolveCarryOver(prev, y, m);
      const updated = {
        ...existing,
        carryOver: prev.carryOverEnabled ? carryOver : existing.carryOver,
      };
      return { ...prev, months: { ...prev.months, [newKey]: updated } };
    });
  }

  const balance = calcBalance(monthData);
  const dailyBudget = calcDailyBudget(balance, year, month);
  const days = remainingDays(year, month);

  return (
    <div className='app'>
      <header className='app-header'>
        <h1>💰 Orçamento Mensal</h1>
      </header>
      <main className='app-main'>
        <MonthNavigator
          year={year}
          month={month}
          onChange={handleMonthChange}
        />
        <Summary
          balance={balance}
          dailyBudget={dailyBudget}
          remainingDays={days}
          carryOver={monthData.carryOver}
          carryOverEnabled={appState.carryOverEnabled}
          onToggleCarryOver={toggleCarryOver}
        />
        <section className='section'>
          <h2 className='section-title'>Nova Transação</h2>
          <TransactionForm onAdd={addTransaction} />
        </section>
        <section className='section'>
          <h2 className='section-title'>Lançamentos</h2>
          <TransactionList
            transactions={monthData.transactions}
            onRemove={removeTransaction}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
