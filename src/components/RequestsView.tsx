import React, { useState } from 'react';
import { useSkillSwap } from '../context/SkillSwapContext.tsx';
import {
  Inbox,
  Send,
  Check,
  X,
  Clock,
  Calendar,
  AlertCircle,
  Coins,
  ArrowRight,
} from 'lucide-react';

export const RequestsView: React.FC = () => {
  const {
    requests,
    currentUserId,
    users,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    setActiveTab,
  } = useSkillSwap();

  const [activeSegment, setActiveSegment] = useState<'received' | 'sent'>('received');

  const receivedRequests = requests.filter((r) => r.toUserId === currentUserId);
  const sentRequests = requests.filter((r) => r.fromUserId === currentUserId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Learning Requests
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Review incoming invitations to teach, or track the status of requests you have sent to campus peers.
          </p>
        </div>

        {/* Segmented Switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveSegment('received')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSegment === 'received'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            Received ({receivedRequests.length})
          </button>
          <button
            onClick={() => setActiveSegment('sent')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSegment === 'sent'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            Sent ({sentRequests.length})
          </button>
        </div>
      </div>

      {/* Content based on segment */}
      {activeSegment === 'received' ? (
        <div className="space-y-3">
          {receivedRequests.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300">
              <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800">No incoming requests yet</h3>
              <p className="text-xs text-slate-500 mt-1">
                When fellow students request a session to learn skills you teach, they will appear right here!
              </p>
            </div>
          ) : (
            receivedRequests.map((req) => {
              const requester = users.find((u) => u.id === req.fromUserId);
              return (
                <div
                  key={req.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <img
                        src={requester?.avatar}
                        alt={requester?.name || 'User'}
                        className="w-12 h-12 rounded-2xl object-cover shrink-0 ring-2 ring-indigo-50"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">
                            {requester?.name}
                          </h4>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md ${
                              req.status === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : req.status === 'accepted'
                                ? 'bg-emerald-100 text-emerald-800'
                                : req.status === 'rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{requester?.headline}</p>
                        <div className="text-xs text-indigo-700 font-bold mt-1">
                          Wants coaching in: "{req.skillName}"
                        </div>
                      </div>
                    </div>

                    <div className="text-right self-start sm:self-auto text-xs text-slate-500">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Proposed: {req.proposedDate}</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-600 font-bold justify-end mt-1">
                        <Coins className="w-3.5 h-3.5" />
                        <span>Earns: +{req.creditCost} Credit</span>
                      </div>
                    </div>
                  </div>

                  {/* Student's Note */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700">
                    <span className="font-bold text-slate-900 block mb-0.5">Learner's Note:</span>
                    "{req.note}"
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-[11px] text-slate-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Received {new Date(req.createdAt).toLocaleDateString()}
                    </span>

                    {req.status === 'pending' ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => rejectRequest(req.id)}
                          className="px-3.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" /> Decline
                        </button>
                        <button
                          onClick={() => acceptRequest(req.id)}
                          className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-200 transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Accept & Schedule
                        </button>
                      </div>
                    ) : req.status === 'accepted' ? (
                      <button
                        onClick={() => setActiveTab('sessions')}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        View in Sessions <ArrowRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <span className="text-xs text-slate-600 italic">No further action needed</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Sent Requests */
        <div className="space-y-3">
          {sentRequests.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300">
              <Send className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800">You haven't sent any requests yet</h3>
              <p className="text-xs text-slate-500 mt-1">
                Explore campus teachers and request a session to begin exchanging skills.
              </p>
              <button
                onClick={() => setActiveTab('discover')}
                className="mt-4 px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl shadow-xs"
              >
                Find Teachers
              </button>
            </div>
          ) : (
            sentRequests.map((req) => {
              const teacher = users.find((u) => u.id === req.toUserId);
              return (
                <div
                  key={req.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <img
                        src={teacher?.avatar}
                        alt={teacher?.name || 'Teacher'}
                        className="w-12 h-12 rounded-2xl object-cover shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">
                            Sent to {teacher?.name}
                          </h4>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md ${
                              req.status === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : req.status === 'accepted'
                                ? 'bg-emerald-100 text-emerald-800'
                                : req.status === 'rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{teacher?.headline}</p>
                        <div className="text-xs text-indigo-700 font-bold mt-1">
                          Requested Topic: "{req.skillName}"
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-xs text-slate-500">
                      <div>Proposed: {req.proposedDate}</div>
                      <div className="text-amber-700 font-semibold mt-0.5">
                        Cost: {req.creditCost} Credit
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700">
                    <span className="font-bold text-slate-900 block mb-0.5">Your Note:</span>
                    "{req.note}"
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-[11px] text-slate-600">
                      Sent {new Date(req.createdAt).toLocaleDateString()}
                    </span>

                    {req.status === 'pending' && (
                      <button
                        onClick={() => cancelRequest(req.id)}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-800"
                      >
                        Cancel Request
                      </button>
                    )}

                    {req.status === 'accepted' && (
                      <button
                        onClick={() => setActiveTab('sessions')}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
                      >
                        Accepted! Go to Sessions <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {req.status === 'rejected' && (
                      <span className="text-xs text-rose-600 font-medium">
                        Declined by teacher
                      </span>
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
