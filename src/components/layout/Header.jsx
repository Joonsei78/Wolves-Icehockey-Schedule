import { useState } from 'react';
import Icon from '../icons/Icon';
import logo from '../../assets/logo.png';

export default function Header({ user, currentPage, onNavigate, onLoginClick }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const goTo = (page) => {
    onNavigate(page);
    setMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="container header__inner">
        <div className="header__brand" role="button" onClick={() => goTo('schedule')}>
          <img src={logo} alt="Wolves Icehockey" className="header__brand-mark" />
          Wolves Icehockey
        </div>

        <nav className="header__nav">
          <a
            className={`header__nav-link ${currentPage === 'schedule' ? 'active' : ''}`}
            onClick={() => goTo('schedule')}
          >
            대회 일정
          </a>
          <a
            className={`header__nav-link ${currentPage === 'annual' ? 'active' : ''}`}
            onClick={() => goTo('annual')}
          >
            연간 일정
          </a>
          {user && (
            <a
              className={`header__nav-link ${currentPage === 'mypage' ? 'active' : ''}`}
              onClick={() => goTo('mypage')}
            >
              마이페이지
            </a>
          )}
          {user?.role === 'admin' && (
            <a
              className={`header__nav-link ${currentPage === 'admin' ? 'active' : ''}`}
              onClick={() => goTo('admin')}
            >
              관리자
            </a>
          )}
        </nav>

        <div className="header__actions">
          {user ? (
            <div className="profile-chip" role="button" tabIndex={0} onClick={() => goTo('mypage')}>
              <span className="profile-chip__avatar">{user.name[0]}</span>
              {user.name}
            </div>
          ) : (
            <button className="btn btn-sm" onClick={onLoginClick}>
              <Icon name="logIn" size={16} />
              로그인
            </button>
          )}
          <button className="header__menu-btn" onClick={() => setMenuOpen((v) => !v)}>
            <Icon name="menu" />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="container" style={{ paddingBottom: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <a className="header__nav-link" onClick={() => goTo('schedule')}>대회 일정</a>
            <a className="header__nav-link" onClick={() => goTo('annual')}>연간 일정</a>
            {user && <a className="header__nav-link" onClick={() => goTo('mypage')}>마이페이지</a>}
            {user?.role === 'admin' && <a className="header__nav-link" onClick={() => goTo('admin')}>관리자</a>}
          </div>
        </div>
      )}
    </header>
  );
}
