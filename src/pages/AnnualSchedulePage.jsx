import Icon from '../components/icons/Icon';
import { getRegisteredNames, isRegisteredByMe } from '../utils/registrations';

const YEAR = 2026;

const fmt = (dateStr) => {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}.${d.getDate()}`;
};

export default function AnnualSchedulePage({ tournaments, registrations, userId, onRegisterClick }) {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 48 }}>
      <div className="section-title">
        <h2>{YEAR}년 연간 일정</h2>
        <span>총 {tournaments.length}건</span>
      </div>

      <div className="annual-list">
        {months.map((m) => {
          const monthKey = `${YEAR}-${String(m).padStart(2, '0')}`;
          const monthTournaments = tournaments.filter((t) => t.month === monthKey);

          return (
            <div className="annual-month" key={monthKey}>
              <div className="annual-month__label">{m}월</div>

              {monthTournaments.length === 0 ? (
                <div className="annual-month__empty">예정된 대회가 없어요.</div>
              ) : (
                <div className="annual-month__rows">
                  {monthTournaments.map((t) => {
                    const names = getRegisteredNames(t, registrations);
                    const isFull = t.status === 'closed' || names.length >= t.slotsTotal;
                    const registered = isRegisteredByMe(t.id, registrations, userId);

                    return (
                      <button className="annual-row" key={t.id} onClick={() => onRegisterClick(t)}>
                        <span className="annual-row__age">{t.ageGroup}</span>
                        <span className="annual-row__title">{t.title}</span>
                        <span className="annual-row__meta">
                          <Icon name="calendar" size={14} />
                          {fmt(t.startDate)} - {fmt(t.endDate)}
                        </span>
                        <span className="annual-row__meta">
                          <Icon name="mapPin" size={14} />
                          {t.location}
                        </span>
                        <span className={`annual-status ${registered ? 'registered' : isFull ? 'closed' : 'open'}`}>
                          {registered ? '신청완료' : isFull ? '마감' : '모집중'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
