import React, { useState, useMemo } from 'react';
import { useSkillSwap } from '../context/SkillSwapContext.tsx';
import type { UserProfile, SkillCategory, ProficiencyLevel, SkillItem } from '../types/index.ts';
import {
  Search,
  Filter,
  Star,
  MapPin,
  Sparkles,
  User,
  GraduationCap,
  BookOpen,
} from 'lucide-react';

import { ProficiencyBadge } from './ProficiencyBadge.tsx';

interface DiscoverViewProps {
  onOpenRequest: (teacher: UserProfile, skill?: SkillItem) => void;
  onOpenProfile: (teacher: UserProfile) => void;
}

const CATEGORIES: ('All' | SkillCategory)[] = [
  'All',
  'Tech & Coding',
  'Languages',
  'Creative & Media',
  'Culinary & Cooking',
  'Communication & Soft Skills',
];

const PROFICIENCIES: ('All' | ProficiencyLevel)[] = ['All', 'Beginner', 'Intermediate', 'Expert'];

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  onOpenRequest,
  onOpenProfile,
}) => {
  const { users, currentUserId } = useSkillSwap();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | SkillCategory>('All');
  const [selectedProficiency, setSelectedProficiency] = useState<'All' | ProficiencyLevel>('All');

  // Filter teachers (exclude self)
  const filteredTeachers = useMemo(() => {
    return users.filter((u) => {
      if (u.id === currentUserId) return false;

      // Text search in name, headline, bio, and skills taught
      const q = searchQuery.toLowerCase().trim();
      const matchesText =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.headline.toLowerCase().includes(q) ||
        u.bio.toLowerCase().includes(q) ||
        u.skillsTeaching.some((s) => s.name.toLowerCase().includes(q));

      if (!matchesText) return false;

      // Category filter: at least one skill taught matches category
      if (selectedCategory !== 'All') {
        const matchesCat = u.skillsTeaching.some(
          (s) => s.category === selectedCategory
        );
        if (!matchesCat) return false;
      }

      // Proficiency filter
      if (selectedProficiency !== 'All') {
        const matchesProf = u.skillsTeaching.some(
          (s) => s.proficiency === selectedProficiency
        );
        if (!matchesProf) return false;
      }

      return true;
    });
  }, [users, currentUserId, searchQuery, selectedCategory, selectedProficiency]);

  return (
    <div className="space-y-6">
      {/* Title & Search Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Discover Peer Teachers & Skills
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Browse students offering 1-on-1 tutoring, exchange practice, and skill mentorship on campus.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by skill (e.g. Python, Spanish, Photography, Cooking) or teacher name..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="space-y-3 pt-2">
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Category:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Proficiency */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">
              Proficiency:
            </span>
            {PROFICIENCIES.map((prof) => (
              <button
                key={prof}
                onClick={() => setSelectedProficiency(prof)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  selectedProficiency === prof
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {prof}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Teachers Grid */}
      {filteredTeachers.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300">
          <User className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No teachers matched your filters</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or selecting "All" categories to explore all available campus teachers.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedProficiency('All');
            }}
            className="mt-4 px-4 py-2 text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTeachers.map((teacher) => (
            <div
              key={teacher.id}
              className="bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-200 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-5 space-y-4">
                {/* Header: Avatar, Name, Location, Rating */}
                <div className="flex items-start gap-3.5">
                  <img
                    src={teacher.avatar}
                    alt={teacher.name}
                    className="w-14 h-14 rounded-2xl object-cover shrink-0 ring-2 ring-indigo-50"
                  />
                  <div className="flex-1 min-w-0">
                    <h3
                      onClick={() => onOpenProfile(teacher)}
                      className="text-sm font-bold text-slate-900 hover:text-indigo-600 cursor-pointer truncate transition-colors"
                    >
                      {teacher.name}
                    </h3>
                    <p className="text-xs text-indigo-600 font-medium truncate mt-0.5">
                      {teacher.headline}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1.5">
                      <span className="flex items-center gap-1 font-bold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {teacher.rating} ({teacher.reviewCount})
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        {teacher.location}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Short Bio */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {teacher.bio}
                </p>

                {/* Skills Taught */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                    Teaches:
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {teacher.skillsTeaching.map((skill) => (
                      <div
                        key={skill.id}
                        className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-indigo-200 transition-colors"
                      >
                        <span className="text-xs font-bold text-slate-800 truncate">
                          {skill.name}
                        </span>
                        <ProficiencyBadge level={skill.proficiency} size="xs" showBar={true} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Looking to Learn */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                    Wants to Learn:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {teacher.skillsLearning.map((skill) => (
                      <div
                        key={skill.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50/80 border border-emerald-100 text-xs text-slate-700"
                      >
                        <span className="font-semibold text-slate-900">{skill.name}</span>
                        <ProficiencyBadge level={skill.proficiency} size="xs" showBar={true} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onOpenProfile(teacher)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors"
                >
                  View Profile
                </button>
                <button
                  onClick={() => onOpenRequest(teacher)}
                  className="px-3.5 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-2xs shadow-indigo-200 transition-all flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Request Session
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
