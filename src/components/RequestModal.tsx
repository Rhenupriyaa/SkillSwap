import React, { useState } from 'react';
import { useSkillSwap } from '../context/SkillSwapContext.tsx';
import type { UserProfile, SkillItem } from '../types/index.ts';
import { X, Calendar, MessageSquare, Coins, AlertCircle, CheckCircle2 } from 'lucide-react';

interface RequestModalProps {
  teacher: UserProfile;
  initialSkill?: SkillItem;
  onClose: () => void;
}

export const RequestModal: React.FC<RequestModalProps> = ({
  teacher,
  initialSkill,
  onClose,
}) => {
  const { currentUser, sendRequest } = useSkillSwap();
  const [selectedSkillName, setSelectedSkillName] = useState(
    initialSkill?.name || teacher.skillsTeaching[0]?.name || ''
  );
  const [proposedDate, setProposedDate] = useState('Tomorrow at 3:00 PM');
  const [note, setNote] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const canAfford = currentUser.credits >= 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkillName) {
      setFeedback({ type: 'error', text: 'Please choose a skill to learn.' });
      return;
    }

    const res = sendRequest(teacher.id, selectedSkillName, note, proposedDate);
    if (!res.success) {
      setFeedback({ type: 'error', text: res.message });
    } else {
      setFeedback({ type: 'success', text: res.message });
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div>
            <h3 className="text-base font-bold text-slate-900">Request a Learning Session</h3>
            <p className="text-xs text-slate-500">
              Propose a 1-on-1 peer exchange session with {teacher.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Teacher Summary Box */}
          <div className="flex items-center gap-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/70">
            <img
              src={teacher.avatar}
              alt={teacher.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-200"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-900 truncate">{teacher.name}</h4>
              <p className="text-xs text-indigo-700 truncate">{teacher.headline}</p>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Rating: ★ {teacher.rating} ({teacher.reviewCount} reviews) · {teacher.location}
              </div>
            </div>
          </div>

          {/* Skill Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Skill You Want to Learn
            </label>
            <select
              value={selectedSkillName}
              onChange={(e) => setSelectedSkillName(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {teacher.skillsTeaching.map((skill) => (
                <option key={skill.id} value={skill.name}>
                  {skill.name} ({skill.proficiency} · {skill.category})
                </option>
              ))}
            </select>
          </div>

          {/* Proposed Date & Time */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Proposed Date & Time
            </label>
            <input
              type="text"
              value={proposedDate}
              onChange={(e) => setProposedDate(e.target.value)}
              placeholder="e.g., Tomorrow at 4:00 PM, or Friday evening"
              required
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              Learning Goals / Message for {teacher.name}
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tell them what specific concepts or challenges you'd like to work on..."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Credit Cost Breakdown */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-600" />
              <span className="text-slate-600">Standard Exchange Fee:</span>
              <span className="font-bold text-slate-900">1 Skill Credit</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500">Your demo balance: </span>
              <span className={`font-extrabold ${canAfford ? 'text-emerald-700' : 'text-rose-600'}`}>
                {currentUser.credits} Credits
              </span>
            </div>
          </div>

          {/* Feedback Banner */}
          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canAfford}
              className={`px-5 py-2 text-sm font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 ${
                canAfford
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-98 shadow-indigo-200'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Send Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
