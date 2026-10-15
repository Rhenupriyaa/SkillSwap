import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canAffordSession,
  processSessionSettlement,
  calculateTotalEarnedAndSpent,
} from './creditLogic.ts';
import type { CreditTransaction } from '../types/index.ts';

test('canAffordSession accurately evaluates affordability', () => {
  assert.equal(canAffordSession(2, 1), true);
  assert.equal(canAffordSession(1, 1), true);
  assert.equal(canAffordSession(0, 1), false);
  assert.equal(canAffordSession(-1, 1), false);
  assert.equal(canAffordSession(5, -1), false);
});

test('processSessionSettlement transfers credit safely from learner to teacher', () => {
  const result = processSessionSettlement(3, 5, 1, false);
  assert.equal(result.success, true);
  assert.equal(result.newLearnerBalance, 2);
  assert.equal(result.newTeacherBalance, 6);
  assert.equal(result.error, undefined);
});

test('processSessionSettlement blocks duplicate settlements', () => {
  const result = processSessionSettlement(3, 5, 1, true);
  assert.equal(result.success, false);
  assert.match(result.error!, /already been settled/i);
  assert.equal(result.newLearnerBalance, 3);
  assert.equal(result.newTeacherBalance, 5);
});

test('processSessionSettlement prevents negative balance settlement', () => {
  const result = processSessionSettlement(0, 5, 1, false);
  assert.equal(result.success, false);
  assert.match(result.error!, /insufficient Skill Credits/i);
  assert.equal(result.newLearnerBalance, 0);
  assert.equal(result.newTeacherBalance, 5);
});

test('calculateTotalEarnedAndSpent correctly sums user transactions', () => {
  const sampleTransactions: CreditTransaction[] = [
    {
      id: 'tx-1',
      userId: 'user-1',
      amount: 3,
      type: 'signup_bonus',
      description: 'Signup bonus',
      timestamp: '2026-10-01',
    },
    {
      id: 'tx-2',
      userId: 'user-1',
      amount: -1,
      type: 'spent_learning',
      description: 'Session with David',
      timestamp: '2026-10-02',
    },
    {
      id: 'tx-3',
      userId: 'user-1',
      amount: 1,
      type: 'earned_teaching',
      description: 'Taught Python to Elena',
      timestamp: '2026-10-03',
    },
    {
      id: 'tx-4',
      userId: 'user-2', // Other user
      amount: 5,
      type: 'earned_teaching',
      description: 'Other user tx',
      timestamp: '2026-10-03',
    },
  ];

  const result = calculateTotalEarnedAndSpent(sampleTransactions, 'user-1');
  assert.equal(result.earned, 4); // 3 + 1
  assert.equal(result.spent, 1);
});
