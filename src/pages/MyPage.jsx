import { useEffect, useState } from 'react';
import Icon from '../components/icons/Icon';
import { fetchProfile, updateProfile } from '../lib/api';

const fmt = (dateStr) => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
};

export default function MyPage({ user, tournaments, registrations, onLogout, onProfileUpdated }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({ name: user.name, phone: '' });

  useEffect(() => {
    fetchProfile(user.id, { name: user.name, email: user.email, role: user.role })
      .then((p) => setProfile({ name: p.name, phone: p.phone || '' }));
  }, [user.id, user.name, user.email, user.role]);

  const myRegistrations = registrations
    .filter((r) => r.userId === user.id)
    .map((r) => ({ record: r, tournament: tournaments.find((t) => t.id === r.tournamentId) }))
    .filter((x) => x.tournament);

  const handleSave = async () => {
    setSaving(true);
    const updated = await updateProfile(user.id, { name: profile.name, phone: profile.phone });
    setSaving(false);
    setEditing(false);
    onProfileUpdated({ name: updated.name });
  };

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 48 }}>
      <div className="section-title">
        <h2>마이페이지</h2>
      </div>

      <div className="card" style={{ padding: 22, marginBottom: 32 }}>
        <div className="mypage-profile-header">
          <div className="mypage-profile-info">
            <span className="profile-chip__avatar" style={{ width: 48, height: 48, fontSize: 18, flexShrink: 0 }}>
              {profile.name[0]}
            </span>
            <div style={{ minWidth: 0 }}>
              <div className="mypage-profile-info__name">{profile.name}</div>
              <div className="mypage-profile-info__email">{user.email}</div>
            </div>
          </div>
          <div className="mypage-profile-actions">
            <button className="btn btn-outline btn-sm" onClick={() => setEditing((v) => !v)}>
              <Icon name="edit" size={15} />
              {editing ? '취소' : '프로필 수정'}
            </button>
            <button className="btn btn-outline btn-sm" onClick={onLogout}>
              로그아웃
            </button>
          </div>
        </div>

        {editing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid var(--border)', paddingTop: 18 }}>
            <div className="field-row">
              <div className="field">
                <label>이름</label>
                <input value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="field">
                <label>연락처</label>
                <input placeholder="010-0000-0000" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />
              </div>
            </div>
            <button className="btn btn-sm" style={{ alignSelf: 'flex-start' }} onClick={handleSave} disabled={saving}>
              {saving ? '저장 중...' : '저장하기'}
            </button>
          </div>
        )}
      </div>

      <div className="section-title">
        <h2>내 참가 신청 내역</h2>
        <span>총 {myRegistrations.length}건</span>
      </div>

      {myRegistrations.length === 0 ? (
        <div className="empty-state">
          <Icon name="calendar" size={40} />
          <p>아직 신청한 대회가 없어요.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {myRegistrations.map(({ record, tournament: t }) => (
            <div key={t.id} className="card reg-card" style={{ padding: 18 }}>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{t.title}</div>
                <div className="card__meta">
                  <Icon name="calendar" size={15} />
                  {fmt(t.startDate)} - {fmt(t.endDate)} · {t.location}
                </div>
                <div className="card__meta">
                  <Icon name="user" size={15} />
                  신청 선수: {record.playerName}
                </div>
              </div>
              <div className="reg-card__status">
                <span className="card__age-badge" style={{ background: 'var(--primary-soft)', color: 'var(--primary-dark)', border: 'none' }}>
                  {t.ageGroup}
                </span>
                <span className={`annual-status ${record.paid ? 'registered' : 'open'}`}>
                  {record.paid ? '입금완료' : '입금대기'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
