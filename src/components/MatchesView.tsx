import React from 'react';
import { useSkillSwap } from '../context/SkillSwapContext.tsx';
import type { UserProfile, SkillItem } from '../types/index.ts';
import {
  Sparkles,
  ArrowRightLeft,
  CheckCircle,
  Star,
  MapPin,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { ProficiencyBadge } from './ProficiencyBadge.tsx';

interface MatchesViewProps {
  onOpenRequest: (teacher: UserProfile, skill?: SkillItem) => void;
  onOpenProfile: (teacher: UserProfile) => void;
}

export const MatchesView: React.FC<MatchesViewProps> = ({
  onOpenRequest,
  onOpenProfile,
}) => {
  const { currentUser, directMatches, setActiveTab } = useSkillSwap();

  const mutualMatches = directMatches.filter((m) => m.isMutual);
  const oneWayMatches = directMatches.filter((m) => !m.isMutual);

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
              Direct Skill Matches
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Our matching algorithm cross-references skills you want to learn with skills taught by peers on campus. Mutual matches are zero-cost 1-to-1 exchanges!
            </p>
          </div>
          <div className="hidden sm:block text-right">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Active Targets
            </span>
            <span className="text-xs font-extrabold text-indigo-600">
              {currentUser.skillsLearning.length} skills sought
            </span>
          </div>
        </div>

        {/* Current User Wishlist Tag Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Skills you want to learn:</span>
          {currentUser.skillsLearning.map((sk) => (
            <span
              key={sk.id}
              className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-900 text-xs font-medium"
            >
              {sk.name}
            </span>
          ))}
          <button
            onClick={() => setActiveTab('profile')}
            className="text-xs font-bold text-indigo-600 hover:underline ml-2"
          >
            + Add more in profile
          </button>
        </div>
      </div>

      {/* Section 1: Mutual Matches (High Priority) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-violet-100 text-violet-700">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
            Mutual Exchanges ({mutualMatches.length})
          </h3>
          <span className="text-xs text-violet-600 font-medium">
            · Both of you teach what the other wants to learn!
          </span>
        </div>

        {mutualMatches.length === 0 ? (
          <div className="bg-white p-6 text-center rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-500">
              No direct mutual matches right now. Check standard matches below or explore multi-person chains!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mutualMatches.map((match) => (
              <div
                key={match.teacher.id}
                className="bg-white rounded-2xl border-2 border-indigo-200 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden"
              >
                {/* Mutual Badge Ribbon */}
                <div className="absolute top-0 right-0 bg-gradient-to-l from-indigo-600 to-violet-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider shadow-xs">
                  Mutual Exchange (98% Match)
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <img
                      src={match.teacher.avatar}
                      alt={match.teacher.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-300"
                    />
                    <div>
                      <h4
                        onClick={() => onOpenProfile(match.teacher)}
                        className="text-sm font-bold text-slate-900 hover:text-indigo-600 cursor-pointer"
                      >
                        {match.teacher.name}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {match.teacher.headline}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                        <span className="font-bold text-amber-500 flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-amber-400" /> {match.teacher.rating}
                        </span>
                        <span>·</span>
                        <span>{match.teacher.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Why this is a mutual match */}
                  <div className="p-3 bg-violet-50/70 border border-violet-100 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2 text-violet-900 font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-violet-600"></span>
                        <span>They teach: <strong>{match.skillMatched.name}</strong></span>
                      </div>
                      <ProficiencyBadge level={match.skillMatched.proficiency} size="xs" showBar={true} />
                    </div>
                    <div className="flex items-center justify-between gap-2 text-indigo-900 font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                        <span>You teach: <strong>{match.mutualSkillOffer?.name}</strong></span>
                      </div>
                      {match.mutualSkillOffer && (
                        <ProficiencyBadge level={match.mutualSkillOffer.proficiency} size="xs" showBar={true} />
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 italic">
                    "{match.matchReason}"
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => onOpenProfile(match.teacher)}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => onOpenRequest(match.teacher, match.skillMatched)}
                    className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" /> Request Mutual Swap
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: One-way Matches */}
      <div className="space-y-3 pt-4">
        <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
          Target Skill Matches ({oneWayMatches.length})
        </h3>

        {oneWayMatches.length === 0 ? (
          <div className="bg-white p-6 text-center rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-500">No other matches found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {oneWayMatches.map((match) => (
              <div
                key={match.teacher.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col justify-between hover:border-indigo-200 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={match.teacher.avatar}
                      alt={match.teacher.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <h4
                        onClick={() => onOpenProfile(match.teacher)}
                        className="text-sm font-bold text-slate-900 hover:text-indigo-600 cursor-pointer truncate"
                      >
                        {match.teacher.name}
                      </h4>
                      <div className="text-[11px] text-amber-500 font-bold mt-0.5 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{match.teacher.rating} ({match.teacher.reviewCount} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-slate-500">Skill Offered: </span>
                        <span className="font-bold text-indigo-700">{match.skillMatched.name}</span>
                      </div>
                      <ProficiencyBadge level={match.skillMatched.proficiency} size="xs" showBar={true} />
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {match.teacher.bio}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => onOpenProfile(match.teacher)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => onOpenRequest(match.teacher, match.skillMatched)}
                    className="px-3.5 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-2xs"
                  >
                    Request Session (1 Cr)
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
