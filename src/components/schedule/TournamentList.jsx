import Icon from '../icons/Icon';
import TournamentCard from './TournamentCard';
import { getRegisteredNames, isRegisteredByMe } from '../../utils/registrations';

export default function TournamentList({ tournaments, registrations, userId, onRegisterClick }) {
  if (tournaments.length === 0) {
    return (
      <div className="empty-state">
        <Icon name="search" size={40} />
        <p>조건에 맞는 대회 일정이 없어요.</p>
      </div>
    );
  }

  return (
    <div className="tournament-grid">
      {tournaments.map((t) => (
        <TournamentCard
          key={t.id}
          tournament={t}
          names={getRegisteredNames(t, registrations)}
          registered={isRegisteredByMe(t.id, registrations, userId)}
          onRegisterClick={onRegisterClick}
        />
      ))}
    </div>
  );
}
