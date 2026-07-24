import { useState } from 'react';
import Icon from '../icons/Icon';
import { getRegisteredNames, getMyRegistration } from '../../utils/registrations';
import { getStatusInfo } from '../../utils/tournamentStatus';
import { BANK_INFO } from '../../data/tournaments';
import { getSubmissionDownloadUrl } from '../../lib/api';

const fmt = (dateStr) => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
};
const won = (n) => `${n.toLocaleString('ko-KR')}원`;

const TABS = [
  { key: 'info', label: '신청 정보' },
  { key: 'docs', label: '서류함' },
  { key: 'fee', label: '참가비' },
];

export default function RegisterModal({ tournament, user, registrations, onClose, onSubmit, onMarkPaid, onSubmitFile, onRequireLogin }) {
  const [tab, setTab] = useState('info');
  const [form, setForm] = useState({
    playerName: '',
    birthYear: '',
    jerseyNumber: '',
    height: '',
    weight: '',
    position: 'Forward',
    hand: 'Left',
    phone: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const names = getRegisteredNames(tournament, registrations);
  const myRecord = getMyRegistration(tournament.id, registrations, user?.id);
  const statusInfo = getStatusInfo(tournament, names.length);
  const bankInfo = tournament.bankAccount
    ? { bankName: tournament.bankName, bankAccount: tournament.bankAccount, bankHolder: tournament.bankHolder }
    : BANK_INFO;

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ tournamentId: tournament.id, ...form });
    } catch (err) {
      setError(err.message);
    }
    setSubmitting(false);
  };

  const handleFileSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    setUploading(true);
    try {
      await onSubmitFile(tournament.id, selectedFile);
      setSelectedFile(null);
    } catch (err) {
      setError(err.message);
    }
    setUploading(false);
  };

  const handleDownloadSubmission = async () => {
    setDownloading(true);
    const url = await getSubmissionDownloadUrl(myRecord.submittedFile, myRecord.submittedFileName);
    window.open(url, '_blank');
    setDownloading(false);
  };

  const copyAccount = () => {
    navigator.clipboard?.writeText(bankInfo.bankAccount);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h3>{tournament.title}</h3>
          <button className="modal__close" onClick={onClose}>
            <Icon name="x" size={20} />
          </button>
        </div>

        <div className="modal__summary" style={{ margin: '16px 22px 0' }}>
          <span>{fmt(tournament.startDate)} - {fmt(tournament.endDate)} · {tournament.location}</span>
          <span>대상 연령 {tournament.ageGroup} · 신청 마감 {fmt(tournament.deadline)}</span>
        </div>

        <div className="tab-bar">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`tab-btn ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'info' && (
          <form onSubmit={handleSubmit}>
            <div className="modal__body">
              <div className="field">
                <label>신청자 명단 ({names.length}/{tournament.slotsTotal}명)</label>
                {names.length > 0 ? (
                  <div className="roster-list">
                    {names.map((n, i) => (
                      <span className="roster-chip" key={`${n}-${i}`}>{n}</span>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 13.5, color: 'var(--sub)' }}>아직 신청자가 없어요. 첫 번째로 신청해보세요!</p>
                )}
              </div>

              {!user ? (
                <div className="modal__summary">
                  <span>로그인 후 참가 신청이 가능해요.</span>
                  <button type="button" className="btn btn-sm" style={{ alignSelf: 'flex-start' }} onClick={onRequireLogin}>
                    로그인하기
                  </button>
                </div>
              ) : myRecord ? (
                <div className="modal__summary">
                  <strong>신청 완료</strong>
                  <span>선수 이름: {myRecord.playerName} (#{myRecord.jerseyNumber})</span>
                  <span>출생연도: {myRecord.birthYear}</span>
                  <span>키/몸무게: {myRecord.height}cm / {myRecord.weight}kg</span>
                  <span>포지션: {myRecord.position} · Hand: {myRecord.hand}</span>
                  <span>연락처: {myRecord.phone}</span>
                </div>
              ) : statusInfo.canRegister ? (
                <>
                  <div className="field-row">
                    <div className="field">
                      <label>선수 이름</label>
                      <input required placeholder="예: 김울프" value={form.playerName} onChange={update('playerName')} />
                    </div>
                    <div className="field">
                      <label>등번호</label>
                      <input required type="number" min="0" placeholder="예: 7" value={form.jerseyNumber} onChange={update('jerseyNumber')} />
                    </div>
                  </div>

                  <div className="field-row">
                    <div className="field">
                      <label>출생연도</label>
                      <input required placeholder="예: 2016" value={form.birthYear} onChange={update('birthYear')} />
                    </div>
                    <div className="field">
                      <label>연락처</label>
                      <input required placeholder="010-0000-0000" value={form.phone} onChange={update('phone')} />
                    </div>
                  </div>

                  <div className="field-row">
                    <div className="field">
                      <label>키 (cm)</label>
                      <input required type="number" min="0" placeholder="예: 145" value={form.height} onChange={update('height')} />
                    </div>
                    <div className="field">
                      <label>몸무게 (kg)</label>
                      <input required type="number" min="0" placeholder="예: 38" value={form.weight} onChange={update('weight')} />
                    </div>
                  </div>

                  <div className="field-row">
                    <div className="field">
                      <label>포지션</label>
                      <select value={form.position} onChange={update('position')}>
                        <option value="Forward">Forward</option>
                        <option value="Defence">Defence</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>Hand</label>
                      <select value={form.hand} onChange={update('hand')}>
                        <option value="Left">Left</option>
                        <option value="Right">Right</option>
                      </select>
                    </div>
                  </div>

                  {error && <p style={{ fontSize: 13, color: 'var(--primary-dark)', fontWeight: 600 }}>{error}</p>}
                </>
              ) : (
                <p style={{ fontSize: 13.5, color: 'var(--sub)' }}>
                  {statusInfo.key === 'upcoming' ? '아직 참가 신청이 시작되지 않았습니다.' : '모집이 마감된 대회입니다.'}
                </p>
              )}
            </div>

            {user && !myRecord && statusInfo.canRegister && (
              <div className="modal__footer">
                <button type="submit" className="btn btn-block" disabled={submitting}>
                  {submitting ? '신청 중...' : '신청 완료하기'}
                </button>
              </div>
            )}
          </form>
        )}

        {tab === 'docs' && (
          <div className="modal__body">
            <div className="field">
              <label>대회 서류 다운로드</label>
              <div className="doc-list">
                {tournament.docs.map((doc) => (
                  <a key={doc.key} className="doc-row" href={doc.url} download={doc.filename}>
                    <Icon name="calendar" size={16} />
                    <span>{doc.label}</span>
                    <Icon name="chevronDown" size={16} className="doc-row__download-icon" />
                  </a>
                ))}
              </div>
            </div>

            {myRecord ? (
              <form onSubmit={handleFileSubmit} className="field">
                <label>제출서류 업로드</label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                />
                <button type="submit" className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start' }} disabled={!selectedFile || uploading}>
                  {uploading ? '업로드 중...' : '제출하기'}
                </button>
                {myRecord.submittedFile && (
                  <button
                    type="button"
                    onClick={handleDownloadSubmission}
                    disabled={downloading}
                    style={{ fontSize: 13, color: '#1a7f4e', display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    <Icon name="checkCircle" size={15} />
                    제출완료: {myRecord.submittedFileName} ({downloading ? '여는 중...' : '다운로드'})
                  </button>
                )}
                {error && <p style={{ fontSize: 13, color: 'var(--primary-dark)', fontWeight: 600 }}>{error}</p>}
              </form>
            ) : (
              <p style={{ fontSize: 13.5, color: 'var(--sub)' }}>참가 신청 후 서류를 제출할 수 있어요.</p>
            )}
          </div>
        )}

        {tab === 'fee' && (
          <div className="modal__body">
            <div className="fee-highlight">
              <span>참가비 (인당)</span>
              <strong>{won(tournament.feePerPerson)}</strong>
            </div>

            <div className="field">
              <label>입금 계좌</label>
              <div className="bank-box">
                <div>
                  <div className="bank-box__account">{bankInfo.bankName} {bankInfo.bankAccount}</div>
                  <div className="bank-box__holder">예금주: {bankInfo.bankHolder}</div>
                </div>
                <button type="button" className="btn btn-outline btn-sm" onClick={copyAccount}>복사</button>
              </div>
            </div>

            {myRecord ? (
              myRecord.paid ? (
                <p style={{ fontSize: 14, color: '#1a7f4e', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                  <Icon name="checkCircle" size={17} />
                  입금 완료
                </p>
              ) : (
                <button type="button" className="btn btn-block" onClick={() => onMarkPaid(tournament.id)}>
                  입금 완료로 표시
                </button>
              )
            ) : (
              <p style={{ fontSize: 13.5, color: 'var(--sub)' }}>참가 신청 후 입금 확인이 가능합니다.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
