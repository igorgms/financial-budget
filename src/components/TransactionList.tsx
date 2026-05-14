import type { Transaction } from '../types';
import { formatCurrency } from '../format';

interface Props {
  transactions: Transaction[];
  onRemove: (id: string) => void;
}

export function TransactionList({ transactions, onRemove }: Props) {
  if (transactions.length === 0) {
    return <p className='empty-msg'>Nenhuma transação neste mês.</p>;
  }

  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <ul className='tx-list'>
      {sorted.map((tx) => (
        <li
          key={tx.id}
          className={`tx-item tx-item--${tx.type}`}
        >
          <span className='tx-desc'>
            {tx.description}
            <small className='tx-date'>
              {new Date(tx.date).toLocaleDateString('pt-BR')}
            </small>
          </span>
          <span className='tx-amount'>
            {tx.type === 'income' ? '+' : '−'} {formatCurrency(tx.amount)}
          </span>
          <button
            className='btn btn--remove'
            aria-label={`Remover transação ${tx.description}`}
            title='Remover'
            onClick={() => onRemove(tx.id)}
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
}
