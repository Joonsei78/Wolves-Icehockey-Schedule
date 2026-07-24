import { useMemo, useState } from 'react';
import Icon from '../components/icons/Icon';
import SearchFilterBar from '../components/schedule/SearchFilterBar';
import MonthTabs from '../components/schedule/MonthTabs';
import TournamentList from '../components/schedule/TournamentList';

export default function SchedulePage({ tournaments, registrations, userId, onRegisterClick }) {
  const [keyword, setKeyword] = useState('');
  const [ageGroup, setAgeGroup] = useState('전체');
  const [activeMonth, setActiveMonth] = useState('all');

  const months = useMemo(
    () => [...new Set(tournaments.map((t) => t.month))].sort(),
    [tournaments]
  );

  const filtered = useMemo(() => {
    return tournaments.filter((t) => {
      const matchKeyword =
        keyword.trim() === '' ||
        t.title.includes(keyword.trim()) ||
        t.location.includes(keyword.trim());
      const matchAge = ageGroup === '전체' || t.ageGroup === ageGroup;
      const matchMonth = activeMonth === 'all' || t.month === activeMonth;
      return matchKeyword && matchAge && matchMonth;
    });
  }, [tournaments, keyword, ageGroup, activeMonth]);

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="hero__badge">
            <Icon name="users" size={15} />
            Wolves Icehockey Team
          </div>
          <h1>울브즈와 함께할<br />다음 대회를 확인하세요</h1>
          <p>월별 참가 예정 대회 일정을 확인하고, 원하는 대회에 바로 참가 신청하세요.</p>
        </div>
      </section>

      <div className="container">
        <SearchFilterBar
          keyword={keyword}
          onKeywordChange={setKeyword}
          ageGroup={ageGroup}
          onAgeGroupChange={setAgeGroup}
        />

        <MonthTabs months={months} activeMonth={activeMonth} onChange={setActiveMonth} />

        <div className="section-title">
          <h2>대회 일정</h2>
          <span>총 {filtered.length}건</span>
        </div>

        <TournamentList
          tournaments={filtered}
          registrations={registrations}
          userId={userId}
          onRegisterClick={onRegisterClick}
        />
      </div>
    </>
  );
}
