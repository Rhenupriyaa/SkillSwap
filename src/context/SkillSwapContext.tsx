import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  UserProfile,
  LearningRequest,
  Session,
  CreditTransaction,
  Review,
  SkillItem,
  MatchResult,
  SkillChain,
} from '../types/index.ts';
import {
  INITIAL_USERS,
  INITIAL_REQUESTS,
  INITIAL_SESSIONS,
  INITIAL_TRANSACTIONS,
  INITIAL_REVIEWS,
} from '../data/mockData.ts';
import {
  canAffordSession,
  processSessionSettlement,
  STANDARD_SESSION_CREDIT_COST,
} from '../utils/creditLogic.ts';
import {
  findDirectMatches,
  findThreePersonChains,
} from '../utils/matchingLogic.ts';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  doc,
  collection,
  setDoc,
  getDocs,
  type FirebaseUser,
} from '../lib/firebase.ts';

const STORAGE_KEY_PREFIX = 'skillswap_v1_';

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`Error loading ${key} from localStorage, resetting to default`, err);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error saving ${key} to localStorage`, err);
  }
}

interface SkillSwapContextType {
  users: UserProfile[];
  currentUserId: string;
  currentUser: UserProfile;
  requests: LearningRequest[];
  sessions: Session[];
  transactions: CreditTransaction[];
  reviews: Review[];
  activeTab: 'dashboard' | 'discover' | 'matches' | 'requests' | 'sessions' | 'credits' | 'chains' | 'profile';
  setActiveTab: (tab: 'dashboard' | 'discover' | 'matches' | 'requests' | 'sessions' | 'credits' | 'chains' | 'profile') => void;
  selectedTeacherId: string | null;
  setSelectedTeacherId: (id: string | null) => void;
  // Demo Switcher
  switchUser: (userId: string) => void;
  // Firebase Auth
  firebaseUser: FirebaseUser | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isFirebaseConnected: boolean;
  // Voice Conversations (gemini-3.8-live)
  isVoicePracticeOpen: boolean;
  voicePracticeSkill?: string;
  openVoicePractice: (skill?: string) => void;
  closeVoicePractice: () => void;
  // Profile editing
  updateProfile: (updates: Partial<UserProfile>) => void;
  addSkill: (type: 'teaching' | 'learning', skill: Omit<SkillItem, 'id'>) => void;
  removeSkill: (type: 'teaching' | 'learning', skillId: string) => void;
  // Requests
  sendRequest: (toUserId: string, skillName: string, note: string, proposedDate: string) => { success: boolean; message: string };
  acceptRequest: (requestId: string) => void;
  rejectRequest: (requestId: string) => void;
  cancelRequest: (requestId: string) => void;
  // Sessions & Credits
  completeSession: (sessionId: string) => { success: boolean; message: string };
  addDemoCredits: (amount?: number) => void;
  // Reviews
  submitReview: (sessionId: string, rating: number, comment: string) => { success: boolean; message: string };
  // Queries & Derivations
  directMatches: MatchResult[];
  skillChains: SkillChain[];
  resetDemoData: () => void;
}

const SkillSwapContext = createContext<SkillSwapContextType | null>(null);

export const SkillSwapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>(() =>
    loadFromStorage('users', INITIAL_USERS)
  );
  const [currentUserId, setCurrentUserId] = useState<string>(() =>
    loadFromStorage('currentUserId', 'user-maya')
  );
  const [requests, setRequests] = useState<LearningRequest[]>(() =>
    loadFromStorage('requests', INITIAL_REQUESTS)
  );
  const [sessions, setSessions] = useState<Session[]>(() =>
    loadFromStorage('sessions', INITIAL_SESSIONS)
  );
  const [transactions, setTransactions] = useState<CreditTransaction[]>(() =>
    loadFromStorage('transactions', INITIAL_TRANSACTIONS)
  );
  const [reviews, setReviews] = useState<Review[]>(() =>
    loadFromStorage('reviews', INITIAL_REVIEWS)
  );
  const [activeTab, setActiveTab] = useState<'dashboard' | 'discover' | 'matches' | 'requests' | 'sessions' | 'credits' | 'chains' | 'profile'>('dashboard');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);

  // Firebase auth state
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(true);

  // Voice Conversations state
  const [isVoicePracticeOpen, setIsVoicePracticeOpen] = useState(false);
  const [voicePracticeSkill, setVoicePracticeSkill] = useState<string | undefined>(undefined);

  // Monitor Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        // User logged in via Firebase Auth!
        // Check if user profile exists in state
        const existingProfile = users.find((u) => u.id === user.uid);
        if (!existingProfile) {
          const newProfile: UserProfile = {
            id: user.uid,
            name: user.displayName || 'Google User',
            headline: 'Campus Peer Learner & Creator',
            bio: 'Student at university excited to share knowledge and exchange skills.',
            location: 'Main Campus & Online',
            avatar:
              user.photoURL ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            credits: 3,
            rating: 5.0,
            reviewCount: 0,
            joinedDate: new Date().toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric',
            }),
            skillsTeaching: [
              {
                id: `sk-t-${Date.now()}`,
                name: 'Web Design & Prototyping',
                category: 'Creative & Media',
                proficiency: 'Intermediate',
                description: 'UI fundamentals, wireframing, and Figma layouts.',
              },
            ],
            skillsLearning: [
              {
                id: `sk-l-${Date.now()}`,
                name: 'Conversational Spanish',
                category: 'Languages',
                proficiency: 'Beginner',
                description: 'Everyday speaking practice.',
              },
            ],
          };

          setUsers((prev) => [newProfile, ...prev.filter((u) => u.id !== user.uid)]);
          setCurrentUserId(user.uid);

          // Save to Firestore /users/{uid}
          try {
            await setDoc(doc(db, 'users', user.uid), newProfile);
          } catch (e) {
            console.warn('Firestore user doc sync:', e);
          }
        } else {
          setCurrentUserId(user.uid);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign-in error:', err);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setFirebaseUser(null);
      setCurrentUserId('user-maya');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const openVoicePractice = (skill?: string) => {
    setVoicePracticeSkill(skill);
    setIsVoicePracticeOpen(true);
  };

  const closeVoicePractice = () => {
    setIsVoicePracticeOpen(false);
  };

  // Sync state changes to localStorage
  useEffect(() => {
    saveToStorage('users', users);
  }, [users]);

  useEffect(() => {
    saveToStorage('currentUserId', currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    saveToStorage('requests', requests);
  }, [requests]);

  useEffect(() => {
    saveToStorage('sessions', sessions);
  }, [sessions]);

  useEffect(() => {
    saveToStorage('transactions', transactions);
  }, [transactions]);

  useEffect(() => {
    saveToStorage('reviews', reviews);
  }, [reviews]);

  const currentUser = users.find((u) => u.id === currentUserId) || users[0] || INITIAL_USERS[0];

  const switchUser = (userId: string) => {
    if (users.some((u) => u.id === userId)) {
      setCurrentUserId(userId);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUserId ? { ...u, ...updates } : u))
    );

    if (firebaseUser && firebaseUser.uid === currentUserId) {
      try {
        await setDoc(doc(db, 'users', currentUserId), updates, { merge: true });
      } catch (e) {
        console.warn('Firestore updateProfile:', e);
      }
    }
  };

  const addSkill = (type: 'teaching' | 'learning', skillData: Omit<SkillItem, 'id'>) => {
    const newSkill: SkillItem = {
      ...skillData,
      id: `sk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== currentUserId) return u;
        if (type === 'teaching') {
          return { ...u, skillsTeaching: [...u.skillsTeaching, newSkill] };
        } else {
          return { ...u, skillsLearning: [...u.skillsLearning, newSkill] };
        }
      })
    );
  };

  const removeSkill = (type: 'teaching' | 'learning', skillId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== currentUserId) return u;
        if (type === 'teaching') {
          return {
            ...u,
            skillsTeaching: u.skillsTeaching.filter((s) => s.id !== skillId),
          };
        } else {
          return {
            ...u,
            skillsLearning: u.skillsLearning.filter((s) => s.id !== skillId),
          };
        }
      })
    );
  };

  const sendRequest = (
    toUserId: string,
    skillName: string,
    note: string,
    proposedDate: string
  ): { success: boolean; message: string } => {
    if (toUserId === currentUserId) {
      return { success: false, message: 'You cannot request a session from yourself.' };
    }

    if (!canAffordSession(currentUser.credits, STANDARD_SESSION_CREDIT_COST)) {
      return {
        success: false,
        message: `Insufficient Skill Credits (${currentUser.credits} available, ${STANDARD_SESSION_CREDIT_COST} needed). Teach a session or add demo credits to continue.`,
      };
    }

    const newRequest: LearningRequest = {
      id: `req-${Date.now()}`,
      fromUserId: currentUserId,
      toUserId,
      skillName,
      note: note.trim() || 'Excited to learn and exchange skills with you!',
      proposedDate: proposedDate.trim() || 'This upcoming week (Flexible)',
      creditCost: STANDARD_SESSION_CREDIT_COST,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setRequests((prev) => [newRequest, ...prev]);

    if (firebaseUser) {
      setDoc(doc(db, 'requests', newRequest.id), newRequest).catch((e) =>
        console.warn('Firestore sendRequest sync:', e)
      );
    }

    return { success: true, message: 'Learning session request sent successfully!' };
  };

  const acceptRequest = (requestId: string) => {
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;

    // Update request status
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'accepted' } : r))
    );

    // Create scheduled session automatically
    const newSession: Session = {
      id: `sess-${Date.now()}`,
      requestId: req.id,
      teacherId: req.toUserId,
      learnerId: req.fromUserId,
      skillName: req.skillName,
      scheduledDate: req.proposedDate,
      durationMinutes: 60,
      status: 'upcoming',
      meetingLink: `https://meet.skillswap.edu/room/${Math.random().toString(36).substring(2, 9)}`,
      creditsTransferred: false,
      reviewSubmitted: false,
    };

    setSessions((prev) => [newSession, ...prev]);

    if (firebaseUser) {
      setDoc(doc(db, 'requests', requestId), { status: 'accepted' }, { merge: true }).catch(
        (e) => console.warn('Firestore acceptRequest sync:', e)
      );
      setDoc(doc(db, 'sessions', newSession.id), newSession).catch((e) =>
        console.warn('Firestore session create sync:', e)
      );
    }
  };

  const rejectRequest = (requestId: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'rejected' } : r))
    );

    if (firebaseUser) {
      setDoc(doc(db, 'requests', requestId), { status: 'rejected' }, { merge: true }).catch(
        (e) => console.warn('Firestore rejectRequest sync:', e)
      );
    }
  };

  const cancelRequest = (requestId: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'cancelled' } : r))
    );
  };

  const completeSession = (sessionId: string): { success: boolean; message: string } => {
    const sess = sessions.find((s) => s.id === sessionId);
    if (!sess) return { success: false, message: 'Session not found.' };

    if (sess.status === 'completed' || sess.creditsTransferred) {
      return { success: false, message: 'This session has already been completed and settled.' };
    }

    const learner = users.find((u) => u.id === sess.learnerId);
    const teacher = users.find((u) => u.id === sess.teacherId);

    if (!learner || !teacher) {
      return { success: false, message: 'Participant profile not found.' };
    }

    // Run settlement logic
    const settlement = processSessionSettlement(
      learner.credits,
      teacher.credits,
      STANDARD_SESSION_CREDIT_COST,
      sess.creditsTransferred
    );

    if (!settlement.success) {
      return { success: false, message: settlement.error || 'Settlement failed.' };
    }

    const nowIso = new Date().toISOString();

    // 1. Update session status
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              status: 'completed',
              creditsTransferred: true,
              completedAt: nowIso,
            }
          : s
      )
    );

    // 2. Update balances of learner and teacher
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === learner.id) {
          return { ...u, credits: settlement.newLearnerBalance };
        }
        if (u.id === teacher.id) {
          return { ...u, credits: settlement.newTeacherBalance };
        }
        return u;
      })
    );

    // 3. Record transactions
    const learnerTx: CreditTransaction = {
      id: `tx-learn-${Date.now()}`,
      userId: learner.id,
      amount: -STANDARD_SESSION_CREDIT_COST,
      type: 'spent_learning',
      description: `Completed session: "${sess.skillName}" with ${teacher.name}`,
      relatedSessionId: sess.id,
      timestamp: nowIso,
    };

    const teacherTx: CreditTransaction = {
      id: `tx-teach-${Date.now() + 1}`,
      userId: teacher.id,
      amount: STANDARD_SESSION_CREDIT_COST,
      type: 'earned_teaching',
      description: `Taught session: "${sess.skillName}" to ${learner.name}`,
      relatedSessionId: sess.id,
      timestamp: nowIso,
    };

    setTransactions((prev) => [learnerTx, teacherTx, ...prev]);

    if (firebaseUser) {
      setDoc(doc(db, 'sessions', sessionId), {
        status: 'completed',
        creditsTransferred: true,
        completedAt: nowIso,
      }, { merge: true }).catch((e) => console.warn('Firestore session complete sync:', e));

      setDoc(doc(db, 'transactions', learnerTx.id), learnerTx).catch((e) =>
        console.warn('Firestore tx sync:', e)
      );
      setDoc(doc(db, 'transactions', teacherTx.id), teacherTx).catch((e) =>
        console.warn('Firestore tx sync:', e)
      );
    }

    return {
      success: true,
      message: `Session completed! 1 Skill Credit transferred from ${learner.name} to ${teacher.name}.`,
    };
  };

  const addDemoCredits = (amount: number = 2) => {
    const nowIso = new Date().toISOString();
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUserId ? { ...u, credits: u.credits + amount } : u
      )
    );

    const grantTx: CreditTransaction = {
      id: `tx-demo-${Date.now()}`,
      userId: currentUserId,
      amount: amount,
      type: 'demo_grant',
      description: `Demo top-up grant (+${amount} credits)`,
      timestamp: nowIso,
    };

    setTransactions((prev) => [grantTx, ...prev]);

    if (firebaseUser) {
      setDoc(doc(db, 'transactions', grantTx.id), grantTx).catch((e) =>
        console.warn('Firestore grantTx sync:', e)
      );
    }
  };

  const submitReview = (
    sessionId: string,
    rating: number,
    comment: string
  ): { success: boolean; message: string } => {
    const sess = sessions.find((s) => s.id === sessionId);
    if (!sess) return { success: false, message: 'Session not found.' };

    if (sess.reviewSubmitted) {
      return { success: false, message: 'Review has already been submitted for this session.' };
    }

    const teacher = users.find((u) => u.id === sess.teacherId);
    if (!teacher) return { success: false, message: 'Teacher profile not found.' };

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      sessionId: sess.id,
      teacherId: teacher.id,
      learnerId: currentUser.id,
      learnerName: currentUser.name,
      learnerAvatar: currentUser.avatar,
      skillName: sess.skillName,
      rating: Math.max(1, Math.min(5, rating)),
      comment: comment.trim() || 'Great session! Very helpful exchange.',
      createdAt: new Date().toISOString(),
    };

    // Update teacher average rating
    const currentTeacherReviews = reviews.filter((r) => r.teacherId === teacher.id);
    const newCount = currentTeacherReviews.length + 1;
    const currentSum = currentTeacherReviews.reduce((sum, r) => sum + r.rating, 0);
    const newRating = Number(((currentSum + rating) / newCount).toFixed(1));

    setUsers((prev) =>
      prev.map((u) =>
        u.id === teacher.id
          ? { ...u, rating: newRating, reviewCount: newCount }
          : u
      )
    );

    setReviews((prev) => [newReview, ...prev]);

    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, reviewSubmitted: true } : s))
    );

    if (firebaseUser) {
      setDoc(doc(db, 'reviews', newReview.id), newReview).catch((e) =>
        console.warn('Firestore review sync:', e)
      );
      setDoc(doc(db, 'sessions', sessionId), { reviewSubmitted: true }, { merge: true }).catch(
        (e) => console.warn('Firestore session review sync:', e)
      );
    }

    return { success: true, message: 'Review submitted successfully!' };
  };

  const resetDemoData = () => {
    setUsers(INITIAL_USERS);
    setCurrentUserId('user-maya');
    setRequests(INITIAL_REQUESTS);
    setSessions(INITIAL_SESSIONS);
    setTransactions(INITIAL_TRANSACTIONS);
    setReviews(INITIAL_REVIEWS);
    setSelectedTeacherId(null);
    setActiveTab('dashboard');
    try {
      localStorage.removeItem(STORAGE_KEY_PREFIX + 'users');
      localStorage.removeItem(STORAGE_KEY_PREFIX + 'currentUserId');
      localStorage.removeItem(STORAGE_KEY_PREFIX + 'requests');
      localStorage.removeItem(STORAGE_KEY_PREFIX + 'sessions');
      localStorage.removeItem(STORAGE_KEY_PREFIX + 'transactions');
      localStorage.removeItem(STORAGE_KEY_PREFIX + 'reviews');
    } catch {
      // ignore
    }
  };

  const directMatches = findDirectMatches(currentUserId, users);
  const skillChains = findThreePersonChains(users);

  return (
    <SkillSwapContext.Provider
      value={{
        users,
        currentUserId,
        currentUser,
        requests,
        sessions,
        transactions,
        reviews,
        activeTab,
        setActiveTab,
        selectedTeacherId,
        setSelectedTeacherId,
        switchUser,
        firebaseUser,
        loginWithGoogle,
        logout,
        isFirebaseConnected,
        isVoicePracticeOpen,
        voicePracticeSkill,
        openVoicePractice,
        closeVoicePractice,
        updateProfile,
        addSkill,
        removeSkill,
        sendRequest,
        acceptRequest,
        rejectRequest,
        cancelRequest,
        completeSession,
        addDemoCredits,
        submitReview,
        directMatches,
        skillChains,
        resetDemoData,
      }}
    >
      {children}
    </SkillSwapContext.Provider>
  );
};

export function useSkillSwap(): SkillSwapContextType {
  const context = useContext(SkillSwapContext);
  if (!context) {
    throw new Error('useSkillSwap must be used within a SkillSwapProvider');
  }
  return context;
}
