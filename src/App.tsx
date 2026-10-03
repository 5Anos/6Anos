import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { WorldsView } from './components/WorldsView';
import { SimulatorsView } from './components/SimulatorsView';
import { ChallengesView } from './components/ChallengesView';
import { BadgesView } from './components/BadgesView';
import { ProfileView } from './components/ProfileView';
import { TeacherArea } from './components/TeacherArea';
import { GrandeMissaoView } from './components/GrandeMissaoView';
import { LoginModal } from './components/LoginModal';

const MainLayout: React.FC = () => {
  const { user, loading, welcomeGreeting, dismissGreeting } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedWorldId, setSelectedWorldId] = useState<number>(1);
  const [activeSimulatorId, setActiveSimulatorId] = useState<string>('sim-password');
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  React.useEffect(() => {
    if (!user && currentTab !== 'dashboard') {
      setCurrentTab('dashboard');
    }
    if (currentTab === 'teacher' && user?.role !== 'teacher') {
      setCurrentTab('dashboard');
    }
  }, [user, currentTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
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

  const handleSelectWorld = (worldId: number) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setSelectedWorldId(worldId);
    setCurrentTab('worlds');
  };

  const handleOpenSimulator = (worldId: number, simId: string) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setSelectedWorldId(worldId);
    setActiveSimulatorId(simId);
    setCurrentTab('simulators');
  };

  const handleOpenWeeklyChallenge = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setCurrentTab('challenges');
  };

  const handleOpenGrandeMissao = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setCurrentTab('grande_missao');
  };

  const handleSelectTab = (tab: string) => {
    if (!user && tab !== 'dashboard') {
      setShowLoginModal(true);
      return;
    }
    if (tab === 'teacher' && user?.role !== 'teacher') {
      return;
    }
    setCurrentTab(tab);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row antialiased text-slate-800">
      {/* Persistent Navigation Sidebar matching mockup */}
      <Sidebar currentTab={currentTab} onSelectTab={handleSelectTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto">
        {/* Top Header Banner with greeting 'Olá, Aluno!' or 'Olá, [Nome]!' and Login button */}
        <Header onOpenLoginModal={() => setShowLoginModal(true)} />

        {/* Dynamic Main View */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10">
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
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

export default App;
