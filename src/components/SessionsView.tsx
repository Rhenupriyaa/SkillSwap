import React, { useState } from 'react';
import { useSkillSwap } from '../context/SkillSwapContext.tsx';
import type { Session } from '../types/index.ts';
import {
  Calendar,
  CheckCircle,
  Video,
  Clock,
  Star,
  ExternalLink,
  Coins,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';

interface SessionsViewProps {
  onOpenReview: (sessionId: string) => void;
}

export const SessionsView: React.FC<SessionsViewProps> = ({ onOpenReview }) => {
  const {
    sessions,
    currentUserId,
    users,
    completeSession,
    reviews,
  } = useSkillSwap();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Filter sessions relevant to the active user (either as teacher or learner)
  const userSessions = sessions.filter(
    (s) => s.teacherId === currentUserId || s.learnerId === currentUserId
  );

  const upcomingSessions = userSessions.filter((s) => s.status === 'upcoming');
  const completedSessions = userSessions.filter((s) => s.status === 'completed');

  const handleComplete = (session: Session) => {
    const res = completeSession(session.id);
    setActionNotice(res.message);
    setTimeout(() => setActionNotice(null), 4000);

    // If current user is learner, offer review immediately
    if (session.learnerId === currentUserId) {
      setTimeout(() => {
        onOpenReview(session.id);
      }, 500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Exchange Sessions
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track scheduled 1-on-1 video rooms, mark completed exchanges, and release Skill Credits.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'upcoming'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Upcoming ({upcomingSessions.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'completed'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Completed ({completedSessions.length})
          </button>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Sessions List */}
      {activeTab === 'upcoming' ? (
        <div className="space-y-4">
          {upcomingSessions.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800">No upcoming sessions</h3>
              <p className="text-xs text-slate-500 mt-1">
                Accepted requests will appear here with instant room links and credit settlement triggers.
              </p>
            </div>
          ) : (
            upcomingSessions.map((sess) => {
              const isTeacher = sess.teacherId === currentUserId;
              const partner = users.find(
                (u) => u.id === (isTeacher ? sess.learnerId : sess.teacherId)
              );

              return (
                <div
                  key={sess.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <img
                        src={partner?.avatar}
                        alt={partner?.name}
                        className="w-12 h-12 rounded-2xl object-cover shrink-0 ring-2 ring-indigo-50"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">
                            {sess.skillName}
                          </h4>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                              isTeacher
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {isTeacher ? 'You are Teaching' : 'You are Learning'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          With {partner?.name} ({partner?.headline})
                        </p>
                        <div className="flex items-center gap-3 text-xs text-slate-600 font-medium mt-1.5">
                          <span className="flex items-center gap-1 text-slate-700">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {sess.scheduledDate} ({sess.durationMinutes} min)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end gap-1 text-xs">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200/80 font-bold">
                        <Coins className="w-3.5 h-3.5 text-amber-600" />
                        <span>
                          {isTeacher ? 'You will earn +1 Credit' : 'Cost: 1 Credit upon completion'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Room Link & Settlement Actions */}
                  <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-600">Video Classroom:</span>
                      <a
                        href={sess.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline bg-white px-2.5 py-1 rounded-lg border border-slate-200"
                      >
                        <Video className="w-3.5 h-3.5" /> Open Room
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => handleComplete(sess)}
                        className="px-4 py-2 text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs shadow-emerald-200 transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark Completed & Release Credit
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Completed Sessions */
        <div className="space-y-4">
          {completedSessions.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300">
              <CheckCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800">No completed sessions recorded</h3>
              <p className="text-xs text-slate-500 mt-1">
                Completed sessions and transferred credits will appear here with review submission options.
              </p>
            </div>
          ) : (
            completedSessions.map((sess) => {
              const isTeacher = sess.teacherId === currentUserId;
              const partner = users.find(
                (u) => u.id === (isTeacher ? sess.learnerId : sess.teacherId)
              );
              const existingReview = reviews.find((r) => r.sessionId === sess.id);

              return (
                <div
                  key={sess.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <img
                        src={partner?.avatar}
                        alt={partner?.name}
                        className="w-12 h-12 rounded-2xl object-cover shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">
                            {sess.skillName}
                          </h4>
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 rounded-md">
                            Completed & Settled
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {isTeacher ? 'Taught to' : 'Learned from'} {partner?.name}
                        </p>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Completed: {sess.completedAt ? new Date(sess.completedAt).toLocaleDateString() : 'Recent'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <span className="font-bold text-emerald-700">
                        {isTeacher ? '+1 Credit Earned' : '-1 Credit Spent'}
                      </span>
                      <span className="block text-[11px] text-slate-400 mt-0.5">
                        Settlement Verified
                      </span>
                    </div>
                  </div>

                  {/* Review Status or Action */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    {existingReview ? (
                      <div className="flex items-center gap-2 text-xs text-slate-700">
                        <div className="flex text-amber-400">
                          {Array.from({ length: existingReview.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                          ))}
                        </div>
                        <span className="font-medium italic">"{existingReview.comment}"</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs text-slate-500">
                          {isTeacher
                            ? 'Awaiting student review submission'
                            : 'Have you rated this session?'}
                        </span>
                        {!isTeacher && (
                          <button
                            onClick={() => onOpenReview(sess.id)}
                            className="px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Star className="w-3.5 h-3.5" /> Leave Review
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
