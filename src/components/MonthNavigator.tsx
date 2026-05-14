import { formatMonth } from '../format';

interface Props {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
}

export function MonthNavigator({ year, month, onChange }: Props) {
  function prev() {
    if (month === 0) onChange(year - 1, 11);
    else onChange(year, month - 1);
  }

  function next() {
    if (month === 11) onChange(year + 1, 0);
    else onChange(year, month + 1);
  }

  return (
    <div className="month-nav">
      <button className="btn btn--nav" onClick={prev} title="Mês anterior">‹</button>
      <span className="month-label">{formatMonth(year, month)}</span>
      <button className="btn btn--nav" onClick={next} title="Próximo mês">›</button>
    </div>
  );
}
