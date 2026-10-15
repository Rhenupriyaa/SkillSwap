import type { CreditTransaction } from '../types/index.ts';

export const STANDARD_SESSION_CREDIT_COST = 1;

/**
 * Checks if a user has sufficient credits to request or start a session
 */
export function canAffordSession(balance: number, cost: number = STANDARD_SESSION_CREDIT_COST): boolean {
  if (cost < 0) return false;
  return balance >= cost;
}

export interface SettlementResult {
  success: boolean;
  newLearnerBalance: number;
  newTeacherBalance: number;
  error?: string;
}

/**
 * Settles credits between a learner and a teacher upon session completion.
 * Guards against duplicate settlements, negative balances, and invalid costs.
 */
export function processSessionSettlement(
  learnerBalance: number,
  teacherBalance: number,
  cost: number = STANDARD_SESSION_CREDIT_COST,
  alreadySettled: boolean = false
): SettlementResult {
  if (alreadySettled) {
    return {
      success: false,
      newLearnerBalance: learnerBalance,
      newTeacherBalance: teacherBalance,
      error: 'Session credits have already been settled for this session.',
    };
  }

  if (cost < 0) {
    return {
      success: false,
      newLearnerBalance: learnerBalance,
      newTeacherBalance: teacherBalance,
      error: 'Credit cost cannot be negative.',
    };
  }

  if (learnerBalance < cost) {
    return {
      success: false,
      newLearnerBalance: learnerBalance,
      newTeacherBalance: teacherBalance,
      error: `Learner has insufficient Skill Credits (${learnerBalance} available, ${cost} required).`,
    };
  }

  const newLearnerBalance = Math.max(0, learnerBalance - cost);
  const newTeacherBalance = teacherBalance + cost;

  return {
    success: true,
    newLearnerBalance,
    newTeacherBalance,
  };
}

/**
 * Aggregates lifetime credits earned and spent from transaction logs
 */
export function calculateTotalEarnedAndSpent(
  transactions: CreditTransaction[],
  userId: string
): { earned: number; spent: number } {
  let earned = 0;
  let spent = 0;

  for (const tx of transactions) {
    if (tx.userId !== userId) continue;
    if (tx.amount > 0) {
      earned += tx.amount;
    } else if (tx.amount < 0) {
      spent += Math.abs(tx.amount);
    }
  }

  return { earned, spent };
}
