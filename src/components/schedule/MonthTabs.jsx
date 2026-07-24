const formatMonthLabel = (ym) => {
  const [, m] = ym.split('-');
  return `${parseInt(m, 10)}월`;
};

export default function MonthTabs({ months, activeMonth, onChange }) {
  return (
    <div className="month-tabs">
      <button
        className={`month-tab ${activeMonth === 'all' ? 'active' : ''}`}
        onClick={() => onChange('all')}
      >
        전체
      </button>
      {months.map((m) => (
        <button
          key={m}
          className={`month-tab ${activeMonth === m ? 'active' : ''}`}
          onClick={() => onChange(m)}
        >
          {formatMonthLabel(m)}
        </button>
      ))}
    </div>
  );
}
