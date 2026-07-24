import Icon from '../icons/Icon';
import { ageGroups } from '../../data/tournaments';

export default function SearchFilterBar({ keyword, onKeywordChange, ageGroup, onAgeGroupChange }) {
  return (
    <div className="filter-bar">
      <div className="filter-bar__search">
        <Icon name="search" size={18} />
        <input
          type="text"
          placeholder="대회명 또는 지역으로 검색"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
        />
      </div>
      <select value={ageGroup} onChange={(e) => onAgeGroupChange(e.target.value)}>
        {ageGroups.map((g) => (
          <option key={g} value={g}>
            {g === '전체' ? '대상 연령 전체' : g}
          </option>
        ))}
      </select>
    </div>
  );
}
