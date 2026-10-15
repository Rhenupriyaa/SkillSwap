import test from 'node:test';
import assert from 'node:assert/strict';
import {
  areSkillsMatching,
  findDirectMatches,
  findThreePersonChains,
} from './matchingLogic.ts';
import type { UserProfile } from '../types/index.ts';

const testUsers: UserProfile[] = [
  {
    id: 'user-maria',
    name: 'Maria Gomez',
    headline: 'Spanish Linguistics Student',
    bio: 'Native Spanish speaker',
    location: 'Campus Library',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    skillsTeaching: [
      { id: 'st-1', name: 'Conversational Spanish', category: 'Languages', proficiency: 'Expert' },
    ],
    skillsLearning: [
      { id: 'sl-1', name: 'Python Programming', category: 'Tech & Coding', proficiency: 'Beginner' },
    ],
    credits: 3,
    rating: 4.9,
    reviewCount: 14,
    joinedDate: '2026-09-01',
  },
  {
    id: 'user-david',
    name: 'David Chen',
    headline: 'CS Junior & TA',
    bio: 'Fullstack and Python developer',
    location: 'Engineering Hall',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    skillsTeaching: [
      { id: 'st-2', name: 'Python Programming', category: 'Tech & Coding', proficiency: 'Expert' },
    ],
    skillsLearning: [
      { id: 'sl-2', name: 'Street Photography', category: 'Creative & Media', proficiency: 'Beginner' },
    ],
    credits: 4,
    rating: 5.0,
    reviewCount: 22,
    joinedDate: '2026-08-15',
  },
  {
    id: 'user-elena',
    name: 'Elena Rostova',
    headline: 'Visual Arts Major',
    bio: 'Award-winning portrait and street photographer',
    location: 'Design Studio',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    skillsTeaching: [
      { id: 'st-3', name: 'Street Photography', category: 'Creative & Media', proficiency: 'Expert' },
    ],
    skillsLearning: [
      { id: 'sl-3', name: 'Conversational Spanish', category: 'Languages', proficiency: 'Beginner' },
    ],
    credits: 2,
    rating: 4.8,
    reviewCount: 9,
    joinedDate: '2026-09-10',
  },
];

test('areSkillsMatching handles whitespace and case variations', () => {
  assert.equal(areSkillsMatching('Python Programming', 'python'), true);
  assert.equal(areSkillsMatching('Conversational Spanish', 'Spanish'), true);
  assert.equal(areSkillsMatching('Cooking', 'Spanish'), false);
});

test('findDirectMatches detects teachers and identifies mutual match', () => {
  // Maria wants Python (David teaches it)
  const matches = findDirectMatches('user-maria', testUsers);
  assert.equal(matches.length, 1);
  assert.equal(matches[0].teacher.id, 'user-david');
  assert.equal(matches[0].skillMatched.name, 'Python Programming');
  // Does David want Spanish? No, David wants Photography, so it's not mutual with Maria directly
  assert.equal(matches[0].isMutual, false);
});

test('findDirectMatches identifies mutual match if two users trade', () => {
  const mutualUser: UserProfile = {
    id: 'user-alex',
    name: 'Alex Rivera',
    headline: 'Data Science',
    bio: 'Loves Python and learning Spanish',
    location: 'North Hall',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    skillsTeaching: [
      { id: 'st-4', name: 'Python Programming', category: 'Tech & Coding', proficiency: 'Expert' },
    ],
    skillsLearning: [
      { id: 'sl-4', name: 'Conversational Spanish', category: 'Languages', proficiency: 'Beginner' },
    ],
    credits: 5,
    rating: 4.9,
    reviewCount: 10,
    joinedDate: '2026-09-01',
  };

  const matches = findDirectMatches('user-maria', [...testUsers, mutualUser]);
  // Alex should be a mutual match and sorted first
  assert.equal(matches[0].teacher.id, 'user-alex');
  assert.equal(matches[0].isMutual, true);
  assert.match(matches[0].matchReason, /Mutual Match!/);
});

test('findThreePersonChains detects valid 3-person exchange loops', () => {
  // Maria (teaches Spanish, wants Python)
  // David (teaches Python, wants Photography)
  // Elena (teaches Photography, wants Spanish)
  // Maria -> Elena (Spanish), Elena -> David (Photography), David -> Maria (Python)
  const chains = findThreePersonChains(testUsers);
  assert.equal(chains.length, 1);
  assert.equal(chains[0].users.length, 3);
  assert.equal(chains[0].links.length, 3);
});
