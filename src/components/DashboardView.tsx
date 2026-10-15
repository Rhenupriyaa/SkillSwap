import React from 'react';
import { useSkillSwap } from '../context/SkillSwapContext.tsx';
import type { UserProfile, SkillItem } from '../types/index.ts';
import {
  Coins,
  GraduationCap,
  BookOpen,
  Calendar,
  Sparkles,
  ArrowRight,
  Check,
  X,
  ExternalLink,
  Clock,
  CheckCircle,
  Video,
  Star,
  Radio,
} from 'lucide-react';

interface DashboardViewProps {
  onOpenRequest: (teacher: UserProfile, skill?: SkillItem) => void;
  onOpenProfile: (teacher: UserProfile) => void;
  onOpenReview: (sessionId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenRequest,
  onOpenProfile,
  onOpenReview,
}) => {
  const {
    currentUser,
    currentUserId,
    requests,
    sessions,
    acceptRequest,
    rejectRequest,
    completeSession,
    directMatches,
    setActiveTab,
    skillChains,
    users,
    openVoicePractice,
  } = useSkillSwap();

  // Filter requests where current user is the teacher and status is pending
  const incomingPendingRequests = requests.filter(
    (r) => r.toUserId === currentUserId && r.status === 'pending'
  );

  // Filter upcoming sessions for the current user
  const userUpcomingSessions = sessions.filter(
    (s) =>
      (s.teacherId === currentUserId || s.learnerId === currentUserId) &&
      s.status === 'upcoming'
  );

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/10">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Campus Peer Skill Exchange Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {currentUser.name}!
          </h1>
          <p className="mt-2 text-sm text-indigo-100/90 leading-relaxed">
            {currentUser.headline}. Teach what you know, spend or earn Skill Credits, and collaborate with fellow campus creators.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('discover')}
              className="px-4 py-2 bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              Discover Teachers <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => openVoicePractice()}
              className="px-4 py-2 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 border border-violet-400/40"
            >
              <Radio className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              Live Voice Tutor (gemini-3.8-live)
            </button>
            <button
              onClick={() => setActiveTab('chains')}
              className="px-4 py-2 bg-indigo-800/80 hover:bg-indigo-700/80 text-white font-semibold text-xs rounded-xl border border-indigo-600/50 transition-colors flex items-center gap-1.5"
            >
              Chain Finder ({skillChains.length} Cycle Available)
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Credits */}
        <div
          onClick={() => setActiveTab('credits')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-indigo-200 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Skill Credits
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{currentUser.credits}</span>
            <span className="text-xs font-semibold text-amber-600">Available</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1">1 credit = 1 hour session</p>
        </div>

        {/* Teaching Skills */}
        <div
          onClick={() => setActiveTab('profile')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-indigo-200 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Teaching
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {currentUser.skillsTeaching.length}
            </span>
            <span className="text-xs font-semibold text-indigo-600">Skills</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1">Ready for exchange</p>
        </div>

        {/* Desired Skills */}
        <div
          onClick={() => setActiveTab('profile')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-indigo-200 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Learning
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {currentUser.skillsLearning.length}
            </span>
            <span className="text-xs font-semibold text-emerald-600">Target Skills</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1">Active learning goals</p>
        </div>

        {/* Upcoming Sessions */}
        <div
          onClick={() => setActiveTab('sessions')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-indigo-200 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Active Sessions
            </span>
            <div className="p-2 rounded-xl bg-violet-50 text-violet-600 group-hover:scale-110 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{userUpcomingSessions.length}</span>
            <span className="text-xs font-semibold text-violet-600">Upcoming</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1">Scheduled exchanges</p>
        </div>
      </div>

      {/* Urgent Action: Pending Learning Requests to Current User */}
      {incomingPendingRequests.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <h3 className="text-sm font-bold text-amber-950">
                Action Required: {incomingPendingRequests.length} Pending Learning Request(s)
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('requests')}
              className="text-xs font-bold text-amber-900 hover:underline"
            >
              View all requests
            </button>
          </div>

          <div className="space-y-3">
            {incomingPendingRequests.map((req) => {
              const requester = users.find((u) => u.id === req.fromUserId);
              return (
                <div
                  key={req.id}
                  className="bg-white p-4 rounded-xl border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={requester?.avatar}
                      alt={requester?.name || 'Requester'}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {requester?.name}
                        </span>
                        <span className="text-[11px] text-slate-500">wants to learn</span>
                        <span className="text-xs font-bold text-indigo-700">
                          "{req.skillName}"
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 italic">"{req.note}"</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {req.proposedDate}
                        </span>
                        <span>·</span>
                        <span>Earns 1 Credit</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => rejectRequest(req.id)}
                      className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Decline
                    </button>
                    <button
                      onClick={() => acceptRequest(req.id)}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-200 transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Accept & Schedule
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Two Column Layout: Upcoming Sessions & Direct Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Upcoming Sessions */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Upcoming Learning Sessions
            </h2>
            <button
              onClick={() => setActiveTab('sessions')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              View all ({sessions.length})
            </button>
          </div>

          {userUpcomingSessions.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-600">No sessions scheduled right now</p>
              <button
                onClick={() => setActiveTab('discover')}
                className="mt-2 text-xs font-bold text-indigo-600 hover:underline"
              >
                Browse teachers & request a session
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {userUpcomingSessions.map((sess) => {
                const isTeaching = sess.teacherId === currentUserId;
                const partner = users.find(
                  (u) => u.id === (isTeaching ? sess.learnerId : sess.teacherId)
                );
                return (
                  <div
                    key={sess.id}
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 flex flex-col justify-between gap-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={partner?.avatar}
                          alt={partner?.name}
                          className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{sess.skillName}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isTeaching
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {isTeaching ? 'You are Teaching' : 'You are Learning'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            With {partner?.name} · {sess.scheduledDate}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                      <a
                        href={sess.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        <Video className="w-3.5 h-3.5" /> Join Room
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>

                      <button
                        onClick={() => {
                          const res = completeSession(sess.id);
                          if (res.success && !isTeaching) {
                            onOpenReview(sess.id);
                          }
                        }}
                        className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-2xs transition-colors flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Mark Completed & Settle
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Direct Matches (Mutual & Skill Matches) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Recommended Matches For You
              </h2>
              <p className="text-[11px] text-slate-500">
                Peers teaching what you want to learn ({currentUser.skillsLearning.map((s) => s.name).join(', ')})
              </p>
            </div>
            <button
              onClick={() => setActiveTab('matches')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              See all
            </button>
          </div>

          <div className="space-y-3">
            {directMatches.slice(0, 3).map((match) => (
              <div
                key={match.teacher.id}
                className="p-3.5 rounded-xl border border-slate-100 hover:border-indigo-200 bg-slate-50/50 hover:bg-indigo-50/20 transition-all flex items-center justify-between gap-3"
              >
                <div
                  className="flex items-center gap-3 cursor-pointer min-w-0"
                  onClick={() => onOpenProfile(match.teacher)}
                >
                  <img
                    src={match.teacher.avatar}
                    alt={match.teacher.name}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {match.teacher.name}
                      </span>
                      {match.isMutual && (
                        <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider bg-violet-100 text-violet-800 rounded">
                          Mutual
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-indigo-600 font-semibold truncate">
                      Teaches: {match.skillMatched.name}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                      <span className="font-bold text-amber-600">{match.teacher.rating}</span>
                      <span>·</span>
                      <span className="truncate">{match.teacher.location}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <button
                    onClick={() => onOpenRequest(match.teacher, match.skillMatched)}
                    className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded-lg transition-colors"
                  >
                    Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
