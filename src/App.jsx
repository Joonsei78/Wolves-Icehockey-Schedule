import { useEffect, useState } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import SchedulePage from './pages/SchedulePage';
import AnnualSchedulePage from './pages/AnnualSchedulePage';
import MyPage from './pages/MyPage';
import AdminPage from './pages/AdminPage';
import RegisterModal from './components/registration/RegisterModal';
import LoginModal from './components/auth/LoginModal';
import SignupModal from './components/auth/SignupModal';
import Icon from './components/icons/Icon';
import { supabase } from './lib/supabaseClient';
import {
  fetchTournaments,
  insertTournament,
  updateTournament,
  fetchRegistrations,
  insertRegistration,
  markRegistrationPaid,
  submitRegistrationFile,
  fetchProfile,
} from './lib/api';

const mapSupabaseUser = (u) => ({
  id: u.id,
  email: u.email,
  name: u.user_metadata?.name || u.email.split('@')[0],
});

export default function App() {
  const [currentPage, setCurrentPage] = useState('schedule');
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [registrations, setRegistrations] = useState([]);

  const [authView, setAuthView] = useState(null); // null | 'login' | 'signup'
  const [registerTarget, setRegisterTarget] = useState(null); // tournament | null
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    // 탭 포커스가 돌아올 때마다 Supabase가 세션을 재확인하며 onAuthStateChange를 다시 쏘는데,
    // 같은 사용자면 아무것도 다시 하지 않아야 입력 중인 폼(관리자 등록 폼 등)이 초기화되지 않는다.
    let syncedUserId = null;

    const syncUser = async (session) => {
      if (!session) {
        syncedUserId = null;
        setUser(null);
        return;
      }
      if (session.user.id === syncedUserId) return;
      syncedUserId = session.user.id;

      const base = mapSupabaseUser(session.user);
      let role = 'member';
      try {
        const profile = await fetchProfile(session.user.id, {
          name: base.name,
          email: base.email,
          role: session.user.user_metadata?.role === 'admin' ? 'admin' : 'member',
        });
        role = profile.role === 'admin' ? 'admin' : 'member';
      } catch (err) {
        console.error(err);
      }
      setUser({ ...base, role });
    };

    supabase.auth.getSession().then(({ data: { session } }) => syncUser(session));

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      syncUser(session);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  const reloadData = () => {
    fetchTournaments().then(setTournaments).catch(console.error);
    fetchRegistrations().then(setRegistrations).catch(console.error);
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleLogin = async ({ email, password }) => {
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(error.message);
      return;
    }
    setAuthView(null);
    setToast('로그인되었습니다.');
  };

  const handleSignup = async ({ name, email, password, role }) => {
    setAuthError(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } },
    });
    if (error) {
      setAuthError(error.message);
      return;
    }
    setAuthView(null);
    setToast(
      data.session
        ? '회원가입이 완료되었습니다.'
        : '가입 확인 이메일을 보냈어요. 메일함을 확인해주세요.'
    );
  };

  const handleOAuthLogin = async (provider) => {
    setAuthError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
    if (error) setAuthError(error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentPage('schedule');
    setToast('로그아웃되었습니다.');
  };

  const handleProfileUpdated = ({ name }) => {
    setUser((u) => (u ? { ...u, name } : u));
    setToast('프로필이 저장되었습니다.');
  };

  const handleRegisterSubmit = async (record) => {
    const saved = await insertRegistration(record, user.id);
    setRegistrations((prev) => [...prev, saved]);
    setToast(`${saved.playerName}님의 참가 신청이 완료되었습니다.`);
  };

  const handleMarkPaid = async (tournamentId) => {
    const updated = await markRegistrationPaid(tournamentId, user.id);
    setRegistrations((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setToast('입금 완료로 표시했습니다.');
  };

  const handleSubmitFile = async (tournamentId, file) => {
    const updated = await submitRegistrationFile(tournamentId, user.id, file);
    setRegistrations((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setToast('서류가 제출되었습니다.');
  };

  const handleAddTournament = async (form) => {
    const created = await insertTournament(form);
    setTournaments((prev) => [...prev, created].sort((a, b) => a.startDate.localeCompare(b.startDate)));
    setToast('대회가 등록되었습니다.');
  };

  const handleUpdateTournament = async (id, form) => {
    const updated = await updateTournament(id, form);
    setTournaments((prev) =>
      prev.map((t) => (t.id === id ? updated : t)).sort((a, b) => a.startDate.localeCompare(b.startDate))
    );
    setToast('대회 정보가 수정되었습니다.');
  };

  return (
    <div>
      <Header
        user={user}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLoginClick={() => setAuthView('login')}
        onLogout={handleLogout}
      />

      {currentPage === 'schedule' && (
        <SchedulePage tournaments={tournaments} registrations={registrations} userId={user?.id} onRegisterClick={setRegisterTarget} />
      )}

      {currentPage === 'annual' && (
        <AnnualSchedulePage tournaments={tournaments} registrations={registrations} userId={user?.id} onRegisterClick={setRegisterTarget} />
      )}

      {currentPage === 'mypage' && user && (
        <MyPage
          user={user}
          tournaments={tournaments}
          registrations={registrations}
          onLogout={handleLogout}
          onProfileUpdated={handleProfileUpdated}
        />
      )}

      {currentPage === 'admin' && user?.role === 'admin' && (
        <AdminPage
          tournaments={tournaments}
          registrations={registrations}
          onAddTournament={handleAddTournament}
          onUpdateTournament={handleUpdateTournament}
        />
      )}

      <Footer />

      {registerTarget && (
        <RegisterModal
          tournament={registerTarget}
          user={user}
          registrations={registrations}
          onClose={() => setRegisterTarget(null)}
          onSubmit={handleRegisterSubmit}
          onMarkPaid={handleMarkPaid}
          onSubmitFile={handleSubmitFile}
          onRequireLogin={() => { setRegisterTarget(null); setAuthView('login'); }}
        />
      )}

      {authView === 'login' && (
        <LoginModal
          error={authError}
          onClose={() => { setAuthView(null); setAuthError(null); }}
          onSwitchToSignup={() => { setAuthView('signup'); setAuthError(null); }}
          onLogin={handleLogin}
          onOAuthLogin={handleOAuthLogin}
        />
      )}

      {authView === 'signup' && (
        <SignupModal
          error={authError}
          onClose={() => { setAuthView(null); setAuthError(null); }}
          onSwitchToLogin={() => { setAuthView('login'); setAuthError(null); }}
          onSignup={handleSignup}
          onOAuthLogin={handleOAuthLogin}
        />
      )}

      {toast && (
        <div className="toast">
          <Icon name="checkCircle" size={18} />
          {toast}
        </div>
      )}
    </div>
  );
}
