import React, { useState } from 'react';
import { SkillSwapProvider, useSkillSwap } from './context/SkillSwapContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { DiscoverView } from './components/DiscoverView.tsx';
import { MatchesView } from './components/MatchesView.tsx';
import { RequestsView } from './components/RequestsView.tsx';
import { SessionsView } from './components/SessionsView.tsx';
import { CreditsView } from './components/CreditsView.tsx';
import { ChainsView } from './components/ChainsView.tsx';
import { ProfileView } from './components/ProfileView.tsx';
import { RequestModal } from './components/RequestModal.tsx';
import { ReviewModal } from './components/ReviewModal.tsx';
import { TeacherDetailModal } from './components/TeacherDetailModal.tsx';
import { VoicePracticeModal } from './components/VoicePracticeModal.tsx';
import { SkillSwapLogo } from './components/SkillSwapLogo.tsx';
import type { UserProfile, SkillItem } from './types/index.ts';

const MainContent: React.FC = () => {
  const {
    activeTab,
    sessions,
    isVoicePracticeOpen,
    voicePracticeSkill,
    closeVoicePractice,
  } = useSkillSwap();

  // Modal states
  const [requestTarget, setRequestTarget] = useState<{
    teacher: UserProfile;
    skill?: SkillItem;
  } | null>(null);

  const [reviewSessionId, setReviewSessionId] = useState<string | null>(null);
  const [detailTeacher, setDetailTeacher] = useState<UserProfile | null>(null);

  const handleOpenRequest = (teacher: UserProfile, skill?: SkillItem) => {
    setRequestTarget({ teacher, skill });
  };

  const handleOpenProfile = (teacher: UserProfile) => {
    setDetailTeacher(teacher);
  };

  const handleOpenReview = (sessionId: string) => {
    setReviewSessionId(sessionId);
  };

  const sessionForReview = sessions.find((s) => s.id === reviewSessionId);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            onOpenRequest={handleOpenRequest}
            onOpenProfile={handleOpenProfile}
            onOpenReview={handleOpenReview}
          />
        )}
        {activeTab === 'discover' && (
          <DiscoverView
            onOpenRequest={handleOpenRequest}
            onOpenProfile={handleOpenProfile}
          />
        )}
        {activeTab === 'matches' && (
          <MatchesView
            onOpenRequest={handleOpenRequest}
            onOpenProfile={handleOpenProfile}
          />
        )}
        {activeTab === 'requests' && <RequestsView />}
        {activeTab === 'sessions' && (
          <SessionsView onOpenReview={handleOpenReview} />
        )}
        {activeTab === 'chains' && (
          <ChainsView onOpenProfile={handleOpenProfile} />
        )}
        {activeTab === 'credits' && <CreditsView />}
        {activeTab === 'profile' && <ProfileView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center text-white">
              <SkillSwapLogo className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-extrabold text-slate-800">
              SkillSwap
            </span>
            <span>· College Project Demonstration MVP</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600">
            <span>Powered by Firebase Auth & Firestore + Gemini 3.8 Live API</span>
          </div>
        </div>
      </footer>

      {/* Active Modals */}
      {requestTarget && (
        <RequestModal
          teacher={requestTarget.teacher}
          initialSkill={requestTarget.skill}
          onClose={() => setRequestTarget(null)}
        />
      )}

      {sessionForReview && (
        <ReviewModal
          session={sessionForReview}
          onClose={() => setReviewSessionId(null)}
        />
      )}

      {detailTeacher && (
        <TeacherDetailModal
          teacher={detailTeacher}
          onRequestSession={(skill) => {
            setDetailTeacher(null);
            setRequestTarget({ teacher: detailTeacher, skill });
          }}
          onClose={() => setDetailTeacher(null)}
        />
      )}

      {isVoicePracticeOpen && (
        <VoicePracticeModal
          initialSkill={voicePracticeSkill}
          onClose={closeVoicePractice}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <SkillSwapProvider>
      <MainContent />
    </SkillSwapProvider>
  );
}
