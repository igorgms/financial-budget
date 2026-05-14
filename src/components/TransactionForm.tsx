import { useState } from 'react';
import type { TransactionType } from '../types';

interface Props {
  onAdd: (description: string, amount: number, type: TransactionType) => void;
}

export function TransactionForm({ onAdd }: Props) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(amount.replace(',', '.'));
    if (!description.trim()) {
      setError('Informe uma descrição.');
      return;
    }
    if (isNaN(parsed) || parsed <= 0) {
      setError('Informe um valor válido maior que zero.');
      return;
    }
    setError('');
    onAdd(description.trim(), parsed, type);
    setDescription('');
    setAmount('');
  }

  return (
    <form onSubmit={handleSubmit} className="transaction-form">
      <div className="form-row">
        <input
          className="input"
          type="text"
          placeholder="Descrição"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <input
          className="input input--amount"
          type="text"
          inputMode="decimal"
          placeholder="Valor (R$)"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
        <div className="type-toggle">
          <button
            type="button"
            className={`toggle-btn toggle-btn--income${type === 'income' ? ' active' : ''}`}
            onClick={() => setType('income')}
          >
            + Entrada
          </button>
          <button
            type="button"
            className={`toggle-btn toggle-btn--expense${type === 'expense' ? ' active' : ''}`}
            onClick={() => setType('expense')}
          >
            − Saída
          </button>
        </div>
        <button className="btn btn--add" type="submit">Adicionar</button>
      </div>
      {error && <p className="form-error">{error}</p>}
    </form>
  );
}
