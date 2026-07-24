import { useState } from 'react';
import Icon from '../icons/Icon';

export default function SignupModal({ onClose, onSwitchToLogin, onSignup, onOAuthLogin, error }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('member');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onSignup({ name: name || '게스트', email, password, role });
    setSubmitting(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h3>회원가입</h3>
          <button className="modal__close" onClick={onClose}>
            <Icon name="x" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal__body">
            <button type="button" className="oauth-btn" onClick={() => onOAuthLogin('google')}>
              <Icon name="user" size={18} />
              Google로 시작하기
            </button>
            <button type="button" className="oauth-btn" disabled>
              <Icon name="user" size={18} />
              카카오로 시작하기 (준비중)
            </button>
            <p style={{ fontSize: 12, color: 'var(--sub)', textAlign: 'center', marginTop: -6 }}>
              Google은 가입 시 일반 회원으로 시작하며, 관리자 권한은 이후 별도로 부여할 수 있어요.
            </p>

            <div className="divider">또는</div>

            <div className="field">
              <label>이름</label>
              <input required placeholder="홍길동" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="field">
              <label>이메일</label>
              <input required type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label>비밀번호</label>
              <input required type="password" minLength={6} placeholder="6자 이상" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <div className="field">
              <label>가입 유형</label>
              <div className="role-toggle">
                <button type="button" className={role === 'member' ? 'active' : ''} onClick={() => setRole('member')}>
                  일반 회원
                </button>
                <button type="button" className={role === 'admin' ? 'active' : ''} onClick={() => setRole('admin')}>
                  감독·코치진
                </button>
              </div>
            </div>

            {error && (
              <p style={{ fontSize: 13, color: 'var(--primary-dark)', fontWeight: 600 }}>{error}</p>
            )}
          </div>

          <div className="modal__footer" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button type="submit" className="btn btn-block" disabled={submitting}>
              {submitting ? '가입 중...' : '회원가입'}
            </button>
            <div className="auth-switch">
              이미 계정이 있으신가요?{' '}
              <button type="button" onClick={onSwitchToLogin}>로그인</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
