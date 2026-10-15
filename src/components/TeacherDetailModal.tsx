import React from 'react';
import { useSkillSwap } from '../context/SkillSwapContext.tsx';
import type { UserProfile, SkillItem } from '../types/index.ts';
import {
  X,
  Star,
  MapPin,
  Calendar,
  BookOpen,
  GraduationCap,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { ProficiencyBadge } from './ProficiencyBadge.tsx';

interface TeacherDetailModalProps {
  teacher: UserProfile;
  onRequestSession: (skill?: SkillItem) => void;
  onClose: () => void;
}

export const TeacherDetailModal: React.FC<TeacherDetailModalProps> = ({
  teacher,
  onRequestSession,
  onClose,
}) => {
  const { reviews, currentUserId } = useSkillSwap();

  const teacherReviews = reviews.filter((r) => r.teacherId === teacher.id);
  const isSelf = teacher.id === currentUserId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Cover & Avatar */}
        <div className="relative bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 px-6 pt-6 pb-4 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <img
              src={teacher.avatar}
              alt={teacher.name}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white/20 shadow-md shrink-0"
            />
            <div className="flex-1 min-w-0 pr-8">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold tracking-tight truncate">{teacher.name}</h2>
                {isSelf && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-white/20 rounded-full">
                    You
                  </span>
                )}
              </div>
              <p className="text-xs text-indigo-100 font-medium mt-1 line-clamp-2">
                {teacher.headline}
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-indigo-200">
                <div className="flex items-center gap-1 font-bold text-amber-300">
                  <Star className="w-3.5 h-3.5 fill-amber-300" />
                  <span>{teacher.rating}</span>
                  <span className="text-indigo-200 font-normal">
                    ({teacher.reviewCount} reviews)
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{teacher.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Joined {teacher.joinedDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Bio */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              About
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              {teacher.bio}
            </p>
          </div>

          {/* Skills They Teach */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                Skills Offered for Teaching ({teacher.skillsTeaching.length})
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {teacher.skillsTeaching.map((skill) => (
                <div
                  key={skill.id}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 bg-white transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="font-bold text-sm text-slate-900">{skill.name}</span>
                      <ProficiencyBadge level={skill.proficiency} size="sm" showBar={true} />
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium mb-1">
                      {skill.category}
                    </div>
                    {skill.description && (
                      <p className="text-xs text-slate-600 line-clamp-2">{skill.description}</p>
                    )}
                  </div>
                  {!isSelf && (
                    <button
                      onClick={() => {
                        onClose();
                        onRequestSession(skill);
                      }}
                      className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-800 text-left flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Request this skill
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Skills They Want to Learn */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              Skills Looking to Learn ({teacher.skillsLearning.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {teacher.skillsLearning.map((skill) => (
                <div
                  key={skill.id}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50/90 border border-emerald-200/80 text-emerald-900 text-xs"
                >
                  <span className="font-bold text-slate-900">{skill.name}</span>
                  <ProficiencyBadge level={skill.proficiency} size="xs" showBar={true} />
                </div>
              ))}
            </div>
          </div>

          {/* Reviews Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-amber-500" />
                Student Reviews ({teacherReviews.length})
              </h4>
            </div>

            {teacherReviews.length === 0 ? (
              <p className="text-xs text-slate-500 italic bg-slate-50 p-4 rounded-xl text-center">
                No reviews recorded for this user yet.
              </p>
            ) : (
              <div className="space-y-3">
                {teacherReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={rev.learnerAvatar}
                          alt={rev.learnerName}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-xs font-bold text-slate-800">
                          {rev.learnerName}
                        </span>
                        <span className="text-[11px] text-slate-400">·</span>
                        <span className="text-[11px] text-slate-500">{rev.skillName}</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 italic pl-8">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Standard Rate: <span className="font-bold text-slate-800">1 Credit / hour</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl"
            >
              Close
            </button>
            {!isSelf && (
              <button
                onClick={() => {
                  onClose();
                  onRequestSession();
                }}
                className="px-5 py-2 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-200 transition-colors"
              >
                Request Session
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
