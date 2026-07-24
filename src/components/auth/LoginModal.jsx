import { useState } from 'react';
import Icon from '../icons/Icon';

export default function LoginModal({ onClose, onSwitchToSignup, onLogin, onOAuthLogin, error }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onLogin({ email, password });
    setSubmitting(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h3>로그인</h3>
          <button className="modal__close" onClick={onClose}>
            <Icon name="x" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal__body">
            <button type="button" className="oauth-btn" onClick={() => onOAuthLogin('google')}>
              <Icon name="user" size={18} />
              Google로 계속하기
            </button>
            <button type="button" className="oauth-btn" onClick={() => onOAuthLogin('kakao')}>
              <Icon name="user" size={18} />
              카카오로 계속하기
            </button>
            <div className="divider">또는</div>

            <div className="field">
              <label>이메일</label>
              <input required type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label>비밀번호</label>
              <input required type="password" placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            {error && (
              <p style={{ fontSize: 13, color: 'var(--primary-dark)', fontWeight: 600 }}>{error}</p>
            )}
          </div>

          <div className="modal__footer" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button type="submit" className="btn btn-block" disabled={submitting}>
              {submitting ? '로그인 중...' : '로그인'}
            </button>
            <div className="auth-switch">
              아직 회원이 아니신가요?{' '}
              <button type="button" onClick={onSwitchToSignup}>회원가입</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
