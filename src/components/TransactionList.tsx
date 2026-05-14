import type { Transaction } from '../types';
import { formatCurrency } from '../format';

interface Props {
  transactions: Transaction[];
  onRemove: (id: string) => void;
}

export function TransactionList({ transactions, onRemove }: Props) {
  if (transactions.length === 0) {
    return <p className="empty-msg">Nenhuma transação neste mês.</p>;
  }

  return (
    <ul className="tx-list">
      {transactions.map(tx => (
        <li key={tx.id} className={`tx-item tx-item--${tx.type}`}>
          <span className="tx-desc">{tx.description}</span>
          <span className="tx-amount">
            {tx.type === 'income' ? '+' : '−'} {formatCurrency(tx.amount)}
          </span>
          <button
            className="btn btn--remove"
            title="Remover"
            onClick={() => onRemove(tx.id)}
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
}
