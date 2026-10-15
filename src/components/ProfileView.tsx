import React, { useState } from 'react';
import { useSkillSwap } from '../context/SkillSwapContext.tsx';
import type { SkillCategory, ProficiencyLevel } from '../types/index.ts';
import {
  User,
  GraduationCap,
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Check,
  Star,
  MapPin,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react';

import { ProficiencyBadge } from './ProficiencyBadge.tsx';

const CATEGORIES: SkillCategory[] = [
  'Tech & Coding',
  'Languages',
  'Creative & Media',
  'Culinary & Cooking',
  'Communication & Soft Skills',
  'Academics & Science',
];

const PROFICIENCIES: ProficiencyLevel[] = ['Beginner', 'Intermediate', 'Expert'];

export const ProfileView: React.FC = () => {
  const {
    currentUser,
    updateProfile,
    addSkill,
    removeSkill,
    reviews,
  } = useSkillSwap();

  // Profile editing mode
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [headline, setHeadline] = useState(currentUser.headline);
  const [bio, setBio] = useState(currentUser.bio);
  const [location, setLocation] = useState(currentUser.location);

  // Add Skill modal/form states
  const [isAddingSkill, setIsAddingSkill] = useState<'teaching' | 'learning' | null>(null);
  const [skillName, setSkillName] = useState('');
  const [skillCategory, setSkillCategory] = useState<SkillCategory>('Tech & Coding');
  const [skillProficiency, setSkillProficiency] = useState<ProficiencyLevel>('Intermediate');
  const [skillDescription, setSkillDescription] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim() || currentUser.name,
      headline: headline.trim() || currentUser.headline,
      bio: bio.trim() || currentUser.bio,
      location: location.trim() || currentUser.location,
    });
    setIsEditingProfile(false);
    showToast('Profile information updated successfully!');
  };

  const handleAddSkillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim() || !isAddingSkill) return;

    addSkill(isAddingSkill, {
      name: skillName.trim(),
      category: skillCategory,
      proficiency: skillProficiency,
      description: skillDescription.trim() || undefined,
    });

    const addedType = isAddingSkill;
    setIsAddingSkill(null);
    setSkillName('');
    setSkillDescription('');
    showToast(`Added "${skillName.trim()}" to skills you ${addedType === 'teaching' ? 'teach' : 'want to learn'}!`);
  };

  const userReviews = reviews.filter((r) => r.teacherId === currentUser.id);

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-16 h-16 rounded-2xl object-cover ring-4 ring-indigo-50"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    {currentUser.name}
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                    Active Demo Role
                  </span>
                </div>
                <p className="text-xs text-indigo-700 font-semibold mt-0.5">
                  {currentUser.headline}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-600 mt-2">
                  <span className="flex items-center gap-1 font-bold text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {currentUser.rating} ({currentUser.reviewCount} reviews)
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {currentUser.location}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setName(currentUser.name);
                setHeadline(currentUser.headline);
                setBio(currentUser.bio);
                setLocation(currentUser.location);
                setIsEditingProfile(!isEditingProfile);
              }}
              className="px-3.5 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Edit2 className="w-3.5 h-3.5" />
              {isEditingProfile ? 'Cancel Editing' : 'Edit Profile'}
            </button>
          </div>

          {/* Edit Form */}
          {isEditingProfile ? (
            <form
              onSubmit={handleSaveProfile}
              className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Campus Location / Setting
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Headline / Campus Major
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  required
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Biography & Background
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg flex items-center gap-1 shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5" /> Save Changes
                </button>
              </div>
            </form>
          ) : (
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              {currentUser.bio}
            </p>
          )}
        </div>
      </div>

      {/* Skills Grids: Teaching & Learning */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skills I Can Teach */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                Skills I Can Teach ({currentUser.skillsTeaching.length})
              </h3>
              <button
                onClick={() => setIsAddingSkill('teaching')}
                className="px-3 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Skill
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Fellow students can discover these skills and send you session requests.
            </p>

            <div className="space-y-2.5">
              {currentUser.skillsTeaching.map((skill) => (
                <div
                  key={skill.id}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors flex items-start justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900">{skill.name}</span>
                      <ProficiencyBadge level={skill.proficiency} size="sm" showBar={true} />
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {skill.category}
                    </div>
                    {skill.description && (
                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                        {skill.description}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => removeSkill('teaching', skill.id)}
                    title="Remove skill"
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Skills I Want to Learn */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                Skills I Want to Learn ({currentUser.skillsLearning.length})
              </h3>
              <button
                onClick={() => setIsAddingSkill('learning')}
                className="px-3 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Goal
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              We match you automatically with campus peers teaching these topics.
            </p>

            <div className="space-y-2.5">
              {currentUser.skillsLearning.map((skill) => (
                <div
                  key={skill.id}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors flex items-start justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900">{skill.name}</span>
                      <ProficiencyBadge level={skill.proficiency} size="sm" showBar={true} prefix="Target:" />
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {skill.category}
                    </div>
                    {skill.description && (
                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                        {skill.description}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => removeSkill('learning', skill.id)}
                    title="Remove skill"
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Skill Modal */}
      {isAddingSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isAddingSkill === 'teaching' ? 'Add Skill You Can Teach' : 'Add Skill You Want to Learn'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isAddingSkill === 'teaching'
                  ? 'Specify what topics you are comfortable guiding a peer through.'
                  : 'Specify what you would like a fellow student to teach you.'}
              </p>
            </div>

            <form onSubmit={handleAddSkillSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Skill Title / Subject
                </label>
                <input
                  type="text"
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  placeholder="e.g. Graphic Design in Figma, Japanese Basics, Baking Sourdough"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={skillCategory}
                    onChange={(e) => setSkillCategory(e.target.value as SkillCategory)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Proficiency Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {PROFICIENCIES.map((p) => {
                      const isSelected = skillProficiency === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setSkillProficiency(p)}
                          className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/70 shadow-2xs ring-1 ring-indigo-500'
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-xs font-bold text-slate-900">{p}</span>
                            {isSelected && (
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                            )}
                          </div>
                          <ProficiencyBadge level={p} size="xs" showBar={true} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Short Description / Scope
                </label>
                <textarea
                  rows={2}
                  value={skillDescription}
                  onChange={(e) => setSkillDescription(e.target.value)}
                  placeholder="Briefly state what you can teach or what specific focus you desire..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingSkill(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reviews Received from Students */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-500" />
            Reviews You Received from Students ({userReviews.length})
          </h3>
          <div className="text-xs text-amber-600 font-bold flex items-center gap-1">
            <span>Average Rating:</span>
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 inline" />
            <span>{currentUser.rating} / 5.0</span>
          </div>
        </div>

        {userReviews.length === 0 ? (
          <p className="text-xs text-slate-500 italic bg-slate-50 p-4 rounded-xl text-center">
            No reviews received yet. Teach a session to build your campus rating!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {userReviews.map((rev) => (
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
                    <span className="text-xs font-bold text-slate-800">{rev.learnerName}</span>
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
  );
};
