import { useRef, useState } from 'react';
import type { TransactionType } from '../types';
import { formatCents } from '../format';

interface Props {
  onAdd: (
    description: string,
    amount: number,
    type: TransactionType,
    date: string,
  ) => void;
}

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function TransactionForm({ onAdd }: Props) {
  const [description, setDescription] = useState('');
  const [amountCents, setAmountCents] = useState(0);
  const [type, setType] = useState<TransactionType>('expense');
  const [date, setDate] = useState(todayISO);
  const [error, setError] = useState('');
  const descRef = useRef<HTMLInputElement>(null);

  const displayAmount = amountCents > 0 ? formatCents(amountCents) : '';

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '');
    const cents = parseInt(digits || '0', 10);
    setAmountCents(Math.min(cents, 99_999_999));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) {
      setError('Informe uma descrição.');
      return;
    }
    if (amountCents <= 0) {
      setError('Informe um valor válido maior que zero.');
      return;
    }
    if (!date) {
      setError('Informe a data do lançamento.');
      return;
    }
    setError('');
    onAdd(
      description.trim(),
      amountCents / 100,
      type,
      new Date(date).toISOString(),
    );
    setDescription('');
    setAmountCents(0);
    setDate(todayISO());
    descRef.current?.focus();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='transaction-form'
    >
      <div className='form-row'>
        <input
          ref={descRef}
          className='input'
          type='text'
          placeholder='Descrição'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          className='input input--amount'
          type='text'
          inputMode='numeric'
          placeholder='R$ 0,00'
          value={displayAmount}
          onChange={handleAmountChange}
        />
        <input
          className='input input--date'
          type='date'
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <div className='type-toggle'>
          <button
            type='button'
            className={`toggle-btn toggle-btn--income${type === 'income' ? ' active' : ''}`}
            onClick={() => setType('income')}
          >
            + Entrada
          </button>
          <button
            type='button'
            className={`toggle-btn toggle-btn--expense${type === 'expense' ? ' active' : ''}`}
            onClick={() => setType('expense')}
          >
            − Saída
          </button>
        </div>
        <button
          className='btn btn--add'
          type='submit'
        >
          Adicionar
        </button>
      </div>
      {error && <p className='form-error'>{error}</p>}
    </form>
  );
}
