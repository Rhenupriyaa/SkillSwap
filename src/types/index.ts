export type SkillCategory =
  | 'Tech & Coding'
  | 'Languages'
  | 'Creative & Media'
  | 'Culinary & Cooking'
  | 'Communication & Soft Skills'
  | 'Academics & Science';

export type ProficiencyLevel = 'Beginner' | 'Intermediate' | 'Expert';

export interface SkillItem {
  id: string;
  name: string;
  category: SkillCategory;
  proficiency: ProficiencyLevel;
  description?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  headline: string;
  bio: string;
  location: string;
  avatar: string;
  skillsTeaching: SkillItem[];
  skillsLearning: SkillItem[];
  credits: number;
  rating: number;
  reviewCount: number;
  joinedDate: string;
}

export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface LearningRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  skillName: string;
  note: string;
  proposedDate: string;
  creditCost: number;
  status: RequestStatus;
  createdAt: string;
}

export type SessionStatus = 'upcoming' | 'completed' | 'cancelled';

export interface Session {
  id: string;
  requestId: string;
  teacherId: string;
  learnerId: string;
  skillName: string;
  scheduledDate: string;
  durationMinutes: number;
  status: SessionStatus;
  meetingLink: string;
  creditsTransferred: boolean;
  reviewSubmitted: boolean;
  completedAt?: string;
}

export type TransactionType =
  | 'earned_teaching'
  | 'spent_learning'
  | 'signup_bonus'
  | 'demo_grant';

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  description: string;
  relatedSessionId?: string;
  timestamp: string;
}

export interface Review {
  id: string;
  sessionId: string;
  teacherId: string;
  learnerId: string;
  learnerName: string;
  learnerAvatar: string;
  skillName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface MatchResult {
  teacher: UserProfile;
  skillMatched: SkillItem;
  learnerWants: SkillItem;
  isMutual: boolean;
  mutualSkillOffer?: SkillItem;
  matchScore: number;
  matchReason: string;
}

export interface SkillChainLink {
  fromUser: UserProfile;
  toUser: UserProfile;
  skillTaught: string;
}

export interface SkillChain {
  id: string;
  users: UserProfile[];
  links: SkillChainLink[];
  summary: string;
}
