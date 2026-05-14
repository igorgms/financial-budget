import { formatCurrency } from '../format';
import { remainingDays } from '../storage';

interface Props {
  balance: number;
  dailyBudget: number;
  year: number;
  month: number;
  carryOver: number;
  carryOverEnabled: boolean;
  onToggleCarryOver: () => void;
}

export function Summary({
  balance,
  dailyBudget,
  year,
  month,
  carryOver,
  carryOverEnabled,
  onToggleCarryOver,
}: Props) {
  const days = remainingDays(year, month);

  return (
    <div className="summary">
      {carryOver !== 0 && (
        <div className="summary-row summary-row--carryover">
          <span>Saldo trazido do mês anterior</span>
          <span className={carryOver >= 0 ? 'positive' : 'negative'}>
            {formatCurrency(carryOver)}
          </span>
        </div>
      )}

      <div className="summary-row">
        <span>Saldo do mês</span>
        <span className={balance >= 0 ? 'positive' : 'negative'}>
          {formatCurrency(balance)}
        </span>
      </div>

      <div className="summary-row summary-row--highlight">
        <span>
          Disponível por dia
          {days > 0 && <small> ({days} {days === 1 ? 'dia restante' : 'dias restantes'})</small>}
        </span>
        <span className={dailyBudget >= 0 ? 'positive' : 'negative'}>
          {days > 0 ? formatCurrency(dailyBudget) : '—'}
        </span>
      </div>

      <label className="carry-over-toggle">
        <input
          type="checkbox"
          checked={carryOverEnabled}
          onChange={onToggleCarryOver}
        />
        <span>Levar saldo restante para o próximo mês</span>
      </label>
    </div>
  );
}
