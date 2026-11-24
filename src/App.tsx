import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { WorldsView } from './components/WorldsView';
import { LearnView } from './components/LearnView';
import { SimulatorsView } from './components/SimulatorsView';
import { ChallengesView } from './components/ChallengesView';
import { BadgesView } from './components/BadgesView';
import { ProfileView } from './components/ProfileView';
import { TeacherArea } from './components/TeacherArea';
import { GrandeMissaoView } from './components/GrandeMissaoView';
import { LoginModal } from './components/LoginModal';
import { RoboGuiaChat } from './components/RoboGuiaChat';

const MainLayout: React.FC = () => {
  const { user, loading, welcomeGreeting, dismissGreeting } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedWorldId, setSelectedWorldId] = useState<number>(1);
  const [activeSimulatorId, setActiveSimulatorId] = useState<string>('sim-password');
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  React.useEffect(() => {
    if (currentTab === 'teacher' && user?.role !== 'teacher') {
      setCurrentTab('dashboard');
    }
  }, [user, currentTab]);

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto animate-bounce shadow-lg">
            🧭
          </div>
          <p className="text-sm font-black text-slate-800 tracking-tight">
            A carregar MISSÃO TIC 6.º ANO...
          </p>
        </div>
      </div>
    );
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectWorld = (worldId: number) => {
    setSelectedWorldId(worldId);
    setCurrentTab('worlds');
    setMobileMenuOpen(false);
    scrollToTop();
  };

  const handleOpenSimulator = (worldId: number, simId: string) => {
    setSelectedWorldId(worldId);
    setActiveSimulatorId(simId);
    setCurrentTab('simulators');
    setMobileMenuOpen(false);
    scrollToTop();
  };

  const handleOpenWeeklyChallenge = () => {
    setCurrentTab('challenges');
    setMobileMenuOpen(false);
    scrollToTop();
  };

  const handleOpenGrandeMissao = () => {
    setCurrentTab('grande_missao');
    setMobileMenuOpen(false);
    scrollToTop();
  };

  const handleSelectTab = (tab: string) => {
    if (tab === 'teacher' && user?.role !== 'teacher') {
      return;
    }
    setCurrentTab(tab);
    setMobileMenuOpen(false);
    scrollToTop();
  };

  return (
    <div className="min-h-[100dvh] bg-slate-100 flex flex-col lg:flex-row antialiased text-slate-800">
      {/* Adaptive Navigation: Desktop Sidebar (lg+), Tablet/Mobile Drawer (< lg), Mobile Bottom Bar (< md) */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        mobileOpen={mobileMenuOpen}
        onOpenMobile={() => setMobileMenuOpen(true)}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-[100dvh]">
        {/* Adaptive Top Header */}
        <Header
          onOpenLoginModal={() => setShowLoginModal(true)}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        {/* Dynamic Main View — generous bottom clearance on mobile for Fixed Bottom Tab Bar */}
        <main className="flex-1 px-3.5 py-4 sm:p-6 lg:p-8 xl:p-10 pb-24 md:pb-10">
          {currentTab === 'dashboard' && (
            <DashboardView
              onSelectWorld={handleSelectWorld}
              onSelectTab={handleSelectTab}
              onOpenSimulator={handleOpenSimulator}
              onOpenWeeklyChallenge={handleOpenWeeklyChallenge}
              onOpenGrandeMissao={handleOpenGrandeMissao}
              onOpenLoginModal={() => setShowLoginModal(true)}
            />
          )}

          {currentTab === 'worlds' && (
            <WorldsView
              initialWorldId={selectedWorldId}
              onOpenSimulator={handleOpenSimulator}
              onOpenLoginModal={() => setShowLoginModal(true)}
            />
          )}

          {currentTab === 'learn' && (
            <LearnView onNavigateTab={handleSelectTab} />
          )}

          {currentTab === 'simulators' && (
            <SimulatorsView
              worldId={selectedWorldId}
              simulatorId={activeSimulatorId}
              onBack={() => setCurrentTab('worlds')}
            />
          )}

          {currentTab === 'challenges' && (
            <ChallengesView
              onOpenSimulators={() => setCurrentTab('simulators')}
            />
          )}

          {currentTab === 'badges' && <BadgesView />}

          {currentTab === 'profile' && <ProfileView />}

          {currentTab === 'teacher' && user?.role === 'teacher' && <TeacherArea />}

          {currentTab === 'grande_missao' && (
            <GrandeMissaoView onBack={() => setCurrentTab('dashboard')} />
          )}
        </main>
      </div>

      {/* Interactive Login & Registration Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          if (user?.role === 'teacher') {
            setCurrentTab('teacher');
          }
        }}
      />

      {/* Personalized Welcome Greeting Dialog */}
      {welcomeGreeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-200 text-amber-900 flex items-center justify-center mx-auto text-3xl shadow-md">
              🎉
            </div>

            <div>
              <div className="text-xs font-black tracking-wider uppercase text-blue-600 mb-1">
                MISSÃO TIC 6.º ANO
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                {welcomeGreeting}
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600">
              Estás pronto para explorar os mundos da tecnologia, segurança digital e programação?
            </p>

            <button
              type="button"
              onClick={dismissGreeting}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm shadow-md transition-all cursor-pointer active:scale-98"
            >
              Começar as Minhas Missões! 🚀
            </button>
          </div>
        </div>
      )}
      {/* Robo-Guia personalized Socratic hint chat (visible for student views) */}
      <RoboGuiaChat visible={currentTab !== 'teacher'} />
    </div>
  );
};

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMessage: string }
> {
  declare props: { children: React.ReactNode };
  state: { hasError: boolean; errorMessage: string } = {
    hasError: false,
    errorMessage: '',
  };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMessage: error?.message || 'Erro inesperado ao carregar a interface.' };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[AppErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl border border-rose-200 shadow-lg p-6 text-center space-y-4">
            <h2 className="text-lg font-black text-slate-900">Ocorreu um erro ao carregar a página</h2>
            <p className="text-xs text-rose-700 bg-rose-50 border border-rose-100 rounded-xl p-3 font-mono break-words">
              {this.state.errorMessage}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold cursor-pointer"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function App() {
  return (
    <AppErrorBoundary>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </AppErrorBoundary>
  );
}

export default App;
