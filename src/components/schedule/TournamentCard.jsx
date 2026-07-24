import Icon from '../icons/Icon';
import { getStatusInfo } from '../../utils/tournamentStatus';

const fmt = (dateStr) => {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}.${d.getDate()}`;
};

export default function TournamentCard({ tournament, names, registered, onRegisterClick }) {
  const { title, location, ageGroup, startDate, endDate, deadline, slotsTotal } = tournament;

  const slotsFilled = names.length;
  const statusInfo = getStatusInfo(tournament, slotsFilled);
  const percent = Math.min(100, Math.round((slotsFilled / slotsTotal) * 100));

  return (
    <div className="card">
      <div className="card__banner">
        <span className="card__age-badge">{ageGroup}</span>
        <span className={`card__status ${statusInfo.key !== 'open' ? 'closed' : ''}`}>
          {statusInfo.label}
        </span>
      </div>

      <div className="card__body">
        <h3 className="card__title">{title}</h3>

        <div className="card__meta">
          <Icon name="calendar" size={16} />
          {fmt(startDate)} - {fmt(endDate)}
        </div>
        <div className="card__meta">
          <Icon name="mapPin" size={16} />
          {location}
        </div>
        <div className="card__meta">
          <Icon name="clock" size={16} />
          신청 마감 {fmt(deadline)}까지
        </div>

        <div className="card__footer">
          <button className="card__slots card__slots--link" onClick={() => onRegisterClick(tournament)}>
            <strong>{slotsFilled}</strong>/{slotsTotal}명 신청 · 명단 보기
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${percent}%` }} />
            </div>
          </button>
          <button
            className="btn btn-sm"
            disabled={!statusInfo.canRegister || registered}
            onClick={() => onRegisterClick(tournament)}
          >
            {registered ? (
              <>
                <Icon name="checkCircle" size={15} />
                신청완료
              </>
            ) : !statusInfo.canRegister ? statusInfo.label : '참가 신청'}
          </button>
        </div>
      </div>
    </div>
  );
}
