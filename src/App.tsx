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
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedWorldId, setSelectedWorldId] = useState<number>(1);
  const [activeSimulatorId, setActiveSimulatorId] = useState<string>('sim-password');
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  React.useEffect(() => {
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
    setSelectedWorldId(worldId);
    setCurrentTab('worlds');
  };

  const handleOpenSimulator = (worldId: number, simId: string) => {
    setSelectedWorldId(worldId);
    setActiveSimulatorId(simId);
    setCurrentTab('simulators');
  };

  const handleOpenWeeklyChallenge = () => {
    setCurrentTab('challenges');
  };

  const handleOpenGrandeMissao = () => {
    setCurrentTab('grande_missao');
  };

  const handleSelectTab = (tab: string) => {
    if (tab === 'teacher' && user?.role !== 'teacher') {
      if (!user) {
        setShowLoginModal(true);
      }
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
              onSelectTab={setCurrentTab}
              onOpenSimulator={handleOpenSimulator}
              onOpenWeeklyChallenge={handleOpenWeeklyChallenge}
              onOpenGrandeMissao={handleOpenGrandeMissao}
            />
          )}

          {currentTab === 'worlds' && (
            <WorldsView
              initialWorldId={selectedWorldId}
              onOpenSimulator={handleOpenSimulator}
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
