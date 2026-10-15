import React, { useState } from 'react';
import { useSkillSwap } from '../context/SkillSwapContext.tsx';
import type { UserProfile } from '../types/index.ts';
import {
  Layers,
  ArrowRight,
  Sparkles,
  Users,
  Repeat,
  CheckCircle2,
  Info,
  Send,
  Zap,
} from 'lucide-react';

interface ChainsViewProps {
  onOpenProfile: (teacher: UserProfile) => void;
}

export const ChainsView: React.FC<ChainsViewProps> = ({ onOpenProfile }) => {
  const { skillChains, users, currentUserId, switchUser, setActiveTab } = useSkillSwap();
  const [activeChainIndex, setActiveChainIndex] = useState(0);
  const [chainInviteSent, setChainInviteSent] = useState(false);

  const activeChain = skillChains[activeChainIndex] || skillChains[0];

  const handleStartChain = () => {
    setChainInviteSent(true);
    setTimeout(() => setChainInviteSent(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold mb-2">
              <Repeat className="w-3.5 h-3.5" />
              <span>Multi-Person Skill Exchange Chains</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Skill Chain Finder (3-Way Circular Swaps)
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              When two students don't have an exact 1-to-1 match, a 3-person closed loop creates a win-win cycle. Person A teaches Person B, Person B teaches Person C, and Person C teaches Person A. Zero net credits required!
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto bg-violet-50 px-3.5 py-2 rounded-xl border border-violet-100 text-xs font-bold text-violet-900">
            <Zap className="w-4 h-4 text-violet-600" />
            <span>{skillChains.length} Verified Cycle{skillChains.length === 1 ? '' : 's'} Detected</span>
          </div>
        </div>

        {/* Cycle Selector Buttons */}
        {skillChains.length > 1 && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
              Select Detected Loop:
            </span>
            {skillChains.map((chain, idx) => (
              <button
                key={chain.id}
                onClick={() => setActiveChainIndex(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeChainIndex === idx
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Cycle #{idx + 1}: {chain.users.map((u) => u.name.split(' ')[0]).join(' ↔ ')}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Chain Showcase */}
      {activeChain ? (
        <div className="bg-gradient-to-b from-indigo-950 via-slate-900 to-indigo-950 rounded-2xl text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
          {/* Subtle background ring */}
          <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Sample Chain Label */}
          <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400">
                Verified Closed Exchange Loop #{activeChainIndex + 1}
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Campus Skill Triangle: {activeChain.links.map((l) => l.skillTaught).join(' ↔ ')}
              </h3>
            </div>
            <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-indigo-200">
              Zero Credit Cost Loop
            </span>
          </div>

          {/* Circular Exchange Visualization */}
          <div className="py-8 grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {activeChain.links.map((link, idx) => {
              const isCurrentUser = link.fromUser.id === currentUserId;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl p-5 border transition-all ${
                    isCurrentUser
                      ? 'bg-indigo-600/30 border-indigo-400/80 ring-2 ring-indigo-400/50'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Step Header */}
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-300 mb-3">
                    <span>Exchange Leg #{idx + 1}</span>
                    {isCurrentUser && (
                      <span className="bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                  </div>

                  {/* Teacher -> Learner */}
                  <div className="flex items-center gap-3">
                    <img
                      src={link.fromUser.avatar}
                      alt={link.fromUser.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-400/40"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold truncate text-white">
                        {link.fromUser.name}
                      </div>
                      <div className="text-xs text-indigo-200/80 truncate">
                        {link.fromUser.headline.split('·')[0]}
                      </div>
                    </div>
                  </div>

                  {/* Skill Taught arrow badge */}
                  <div className="my-4 p-3 rounded-xl bg-black/30 border border-white/10 text-center">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                      Teaches Skill:
                    </span>
                    <span className="text-sm font-extrabold text-amber-300 block mt-0.5">
                      "{link.skillTaught}"
                    </span>
                    <div className="flex items-center justify-center gap-1 text-[11px] text-indigo-200 mt-1">
                      <span>to</span>
                      <ArrowRight className="w-3 h-3 text-indigo-400" />
                      <strong className="text-white">{link.toUser.name}</strong>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="pt-2 flex items-center justify-between text-xs">
                    <button
                      onClick={() => onOpenProfile(link.fromUser)}
                      className="text-indigo-300 hover:text-white underline font-medium"
                    >
                      View profile
                    </button>
                    <button
                      onClick={() => switchUser(link.fromUser.id)}
                      className="text-xs font-semibold text-amber-400 hover:text-amber-300"
                    >
                      Switch to role
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Explanation Text */}
          <div className="bg-white/5 rounded-2xl p-5 border border-white/10 text-xs text-indigo-100 leading-relaxed space-y-2">
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <Info className="w-4 h-4 text-indigo-400" />
              How this chain achieves balance:
            </div>
            <ul className="list-disc list-inside space-y-1 text-indigo-200/90 pl-1">
              {activeChain.links.map((link, idx) => (
                <li key={idx}>
                  <strong>{link.fromUser.name}</strong> teaches <em>{link.skillTaught}</em> to {link.toUser.name}, and in return learns from the cycle.
                </li>
              ))}
            </ul>
            <p className="pt-1 text-slate-300">
              Each student gives 1 hour of their expertise and receives 1 hour of desired coaching. The total net credit transfer is exactly 0!
            </p>
          </div>

          {/* Action Trigger */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/10">
            <div className="text-xs text-indigo-300">
              All 3 students are active on campus and match these learning preferences.
            </div>

            <button
              onClick={handleStartChain}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/20 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Coordinate 3-Way Chain Request
            </button>
          </div>

          {chainInviteSent && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Demonstration invitations sent to {activeChain.users.map((u) => u.name).join(', ')} to coordinate the 3-way exchange time slot!
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300">
          <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No active chains found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Add skills you can teach and skills you want to learn to help discover circular matches!
          </p>
        </div>
      )}

      {/* Dynamic Chain Detection Explained */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          Algorithmic Cycle Detection
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          The SkillSwap engine searches directed graph permutations of length 3: finding combinations where User A's teaching matches User B's learning, User B's teaching matches User C's learning, and User C's teaching matches User A's learning. This removes the friction of waiting for 1-to-1 mutual interest.
        </p>
      </div>
    </div>
  );
};
