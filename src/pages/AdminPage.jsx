import { useState } from 'react';
import Icon from '../components/icons/Icon';
import { ageGroups, BANK_INFO } from '../data/tournaments';
import { getTournamentRoster } from '../utils/registrations';
import { getStatusInfo } from '../utils/tournamentStatus';
import { downloadCSV } from '../utils/csv';
import { getSubmissionDownloadUrl } from '../lib/api';

const ROSTER_HEADERS = ['이름', '등번호', '출생연도', '포지션', 'Hand', '키(cm)', '몸무게(kg)', '연락처'];

const rosterRow = (r) => [
  r.playerName, r.jerseyNumber, r.birthYear, r.position, r.hand, r.height, r.weight, r.phone,
];

const fmt = (dateStr) => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
};

const emptyForm = {
  title: '',
  location: '',
  ageGroup: 'U10',
  startDate: '',
  endDate: '',
  deadline: '',
  slotsTotal: '',
  feePerPerson: '',
  description: '',
  status: 'open',
  useCustomBank: false,
  bankName: '',
  bankAccount: '',
  bankHolder: '',
};

const toForm = (t) => ({
  title: t.title,
  location: t.location,
  ageGroup: t.ageGroup,
  startDate: t.startDate,
  endDate: t.endDate,
  deadline: t.deadline,
  slotsTotal: String(t.slotsTotal),
  feePerPerson: String(t.feePerPerson),
  description: t.description || '',
  status: t.status,
  useCustomBank: !!t.bankAccount,
  bankName: t.bankName || '',
  bankAccount: t.bankAccount || '',
  bankHolder: t.bankHolder || '',
});

export default function AdminPage({ tournaments, registrations, onAddTournament, onUpdateTournament }) {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const startEdit = (t) => {
    setEditingId(t.id);
    setForm(toForm(t));
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (editingId) {
        await onUpdateTournament(editingId, form);
        setEditingId(null);
      } else {
        await onAddTournament(form);
      }
      setForm(emptyForm);
    } catch (err) {
      setError(err.message);
    }
    setSubmitting(false);
  };

  const handleDownloadRoster = (t) => {
    const roster = getTournamentRoster(t.id, registrations);
    downloadCSV(`${t.title}_참가선수명단.csv`, [ROSTER_HEADERS, ...roster.map(rosterRow)]);
  };

  const handleOpenSubmission = async (path, fileName) => {
    const url = await getSubmissionDownloadUrl(path, fileName);
    window.open(url, '_blank');
  };

  const sorted = [...tournaments].sort((a, b) => a.startDate.localeCompare(b.startDate));

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 48 }}>
      <div className="section-title">
        <h2>{editingId ? '관리자 · 대회 정보 수정' : '관리자 · 대회 정보 등록'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 40 }}>
        <div className="field">
          <label>대회명</label>
          <input required placeholder="예: 전국 U12 스프링컵" value={form.title} onChange={update('title')} />
        </div>

        <div className="field-row">
          <div className="field">
            <label>장소</label>
            <input required placeholder="예: 서울 목동 아이스링크" value={form.location} onChange={update('location')} />
          </div>
          <div className="field">
            <label>대상 연령</label>
            <select value={form.ageGroup} onChange={update('ageGroup')}>
              {ageGroups.filter((g) => g !== '전체').map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>대회 시작일</label>
            <input required type="date" value={form.startDate} onChange={update('startDate')} />
          </div>
          <div className="field">
            <label>대회 종료일</label>
            <input required type="date" value={form.endDate} onChange={update('endDate')} />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>신청 마감일</label>
            <input required type="date" value={form.deadline} onChange={update('deadline')} />
          </div>
          <div className="field">
            <label>모집 인원</label>
            <input required type="number" min="1" placeholder="예: 20" value={form.slotsTotal} onChange={update('slotsTotal')} />
          </div>
        </div>

        <div className="field">
          <label>참가비 (인당, 원)</label>
          <input required type="number" min="0" placeholder="예: 80000" value={form.feePerPerson} onChange={update('feePerPerson')} />
        </div>

        <div className="field">
          <label>대회 소개</label>
          <input placeholder="간단한 대회 설명" value={form.description} onChange={update('description')} />
        </div>

        {editingId && (
          <div className="field">
            <label>모집 상태</label>
            <select value={form.status} onChange={update('status')}>
              <option value="upcoming">예정</option>
              <option value="open">모집중</option>
              <option value="closed">신청마감</option>
            </select>
          </div>
        )}

        <div className="field">
          <label>입금 계좌</label>
          <div className="role-toggle">
            <button
              type="button"
              className={!form.useCustomBank ? 'active' : ''}
              onClick={() => setForm((f) => ({ ...f, useCustomBank: false }))}
            >
              기본 계좌 사용
            </button>
            <button
              type="button"
              className={form.useCustomBank ? 'active' : ''}
              onClick={() => setForm((f) => ({ ...f, useCustomBank: true }))}
            >
              직접 입력
            </button>
          </div>
        </div>

        {form.useCustomBank ? (
          <>
            <div className="field-row">
              <div className="field">
                <label>은행명</label>
                <input required placeholder="예: 하나은행" value={form.bankName} onChange={update('bankName')} />
              </div>
              <div className="field">
                <label>계좌번호</label>
                <input required placeholder="예: 21891041935107" value={form.bankAccount} onChange={update('bankAccount')} />
              </div>
            </div>
            <div className="field">
              <label>예금주</label>
              <input required placeholder="예: 김덕준" value={form.bankHolder} onChange={update('bankHolder')} />
            </div>
          </>
        ) : (
          <div className="bank-box">
            <div>
              <div className="bank-box__account">{BANK_INFO.bankName} {BANK_INFO.bankAccount}</div>
              <div className="bank-box__holder">예금주: {BANK_INFO.bankHolder}</div>
            </div>
          </div>
        )}

        <p style={{ fontSize: 12.5, color: 'var(--sub)' }}>
          * 개최공문·요강 등 서류 업로드는 이후 단계에서 지원됩니다.
        </p>

        {error && <p style={{ fontSize: 13, color: 'var(--primary-dark)', fontWeight: 600 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" className="btn" style={{ alignSelf: 'flex-start' }} disabled={submitting}>
            <Icon name="calendar" size={16} />
            {submitting ? '저장 중...' : editingId ? '수정 완료' : '대회 등록하기'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-outline" onClick={cancelEdit}>
              취소
            </button>
          )}
        </div>
      </form>

      <div className="section-title">
        <h2>등록된 대회 목록</h2>
        <span>총 {tournaments.length}건</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sorted.map((t) => {
          const roster = getTournamentRoster(t.id, registrations);
          const withFiles = roster.filter((r) => r.submittedFile);
          const statusInfo = getStatusInfo(t, roster.length);
          return (
            <div key={t.id} className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700 }}>{t.title}</span>
                    <span className={`annual-status ${statusInfo.key === 'open' ? 'open' : statusInfo.key === 'upcoming' ? 'upcoming' : 'closed'}`}>
                      {statusInfo.key === 'closed' ? '신청마감' : statusInfo.label}
                    </span>
                  </div>
                  <div className="card__meta">
                    <Icon name="calendar" size={14} />
                    {fmt(t.startDate)} - {fmt(t.endDate)} · {t.location}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span className="card__age-badge" style={{ background: 'var(--primary-soft)', color: 'var(--primary-dark)', border: 'none' }}>
                    {t.ageGroup}
                  </span>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => startEdit(t)}>
                    <Icon name="edit" size={14} />
                    수정
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    disabled={roster.length === 0}
                    onClick={() => handleDownloadRoster(t)}
                  >
                    <Icon name="checkCircle" size={14} />
                    명단 다운로드 ({roster.length})
                  </button>
                </div>
              </div>

              {withFiles.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                  {withFiles.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      className="roster-chip"
                      style={{ cursor: 'pointer', border: 'none' }}
                      onClick={() => handleOpenSubmission(r.submittedFile, r.submittedFileName)}
                    >
                      {r.playerName} 제출서류
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p style={{ fontSize: 12.5, color: 'var(--sub)', marginTop: 12 }}>
        * 다운로드되는 명단은 신청 폼으로 접수된(세부 정보 포함) 참가자만 포함됩니다.
      </p>
    </div>
  );
}
