import React, { useState } from 'react';
import { useSkillSwap } from '../context/SkillSwapContext.tsx';
import { calculateTotalEarnedAndSpent } from '../utils/creditLogic.ts';
import {
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Gift,
  PlusCircle,
  ShieldAlert,
  Info,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export const CreditsView: React.FC = () => {
  const {
    currentUser,
    currentUserId,
    transactions,
    addDemoCredits,
  } = useSkillSwap();

  const [topUpNotice, setTopUpNotice] = useState<string | null>(null);

  // User specific transactions
  const userTransactions = transactions.filter((t) => t.userId === currentUserId);
  const { earned, spent } = calculateTotalEarnedAndSpent(transactions, currentUserId);

  const handleTopUp = (amount: number) => {
    addDemoCredits(amount);
    setTopUpNotice(`Added +${amount} Demo Skill Credits to ${currentUser.name}'s account.`);
    setTimeout(() => setTopUpNotice(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer Banner as required by specs */}
      <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 text-amber-900 text-xs">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold block text-sm mb-0.5">
            College Demo Credit System
          </span>
          Skill Credits in this prototype operate under a local peer-to-peer demonstration model stored in your browser. It is not an actual currency or secure banking ledger. Each 1 Credit represents 1 hour of peer instruction.
        </div>
      </div>

      {/* Credit Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current Balance */}
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 text-white rounded-2xl p-6 shadow-md shadow-indigo-950/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-indigo-200 text-xs font-bold uppercase tracking-wider">
              <span>Available Balance</span>
              <Coins className="w-5 h-5 text-amber-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-black tracking-tight">{currentUser.credits}</span>
              <span className="text-sm text-amber-300 font-semibold">Skill Credits</span>
            </div>
            <p className="text-xs text-indigo-200/80 mt-1">
              Sufficient for {currentUser.credits} hour{currentUser.credits === 1 ? '' : 's'} of learning
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-indigo-700/60 flex items-center gap-2">
            <button
              onClick={() => handleTopUp(2)}
              className="px-3 py-1.5 text-xs font-bold bg-white text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Demo Top-Up (+2)
            </button>
            <button
              onClick={() => handleTopUp(5)}
              className="px-3 py-1.5 text-xs font-semibold bg-indigo-700/60 hover:bg-indigo-600 text-white rounded-lg border border-indigo-500/40 transition-colors"
            >
              +5
            </button>
          </div>
        </div>

        {/* Lifetime Earned */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>Lifetime Earned</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">+{earned}</span>
              <span className="text-xs font-bold text-emerald-600">Credits</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              From peer coaching and welcome grants
            </p>
          </div>
          <div className="mt-4 text-[11px] text-slate-400">
            Rule: Teaching 1 hour adds +1 credit automatically upon completion.
          </div>
        </div>

        {/* Lifetime Spent */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>Lifetime Spent</span>
              <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">-{spent}</span>
              <span className="text-xs font-bold text-rose-600">Credits</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Transferred to peer teachers for completed lessons
            </p>
          </div>
          <div className="mt-4 text-[11px] text-slate-400">
            Rule: Negative balances and duplicate deductions are strictly blocked.
          </div>
        </div>
      </div>

      {topUpNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{topUpNotice}</span>
        </div>
      )}

      {/* Credit Rules & Economy Explanation */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-600" />
          Transparent Demo Exchange Rules
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="font-bold text-slate-900 block mb-1">1. Standard 1:1 Rate</span>
            Every 60-minute learning session is valued at exactly 1 Skill Credit, regardless of skill domain.
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="font-bold text-slate-900 block mb-1">2. Settlement Upon Completion</span>
            Credits are only transferred when a session is marked completed, avoiding disputes and escrow locks.
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="font-bold text-slate-900 block mb-1">3. Zero-Credit Chains</span>
            Multi-person skill chains allow 3 or more students to swap skills in a closed circle without spending credits!
          </div>
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            Transaction History for {currentUser.name}
          </h3>
          <span className="text-xs text-slate-400">
            {userTransactions.length} entries recorded
          </span>
        </div>

        {userTransactions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No transactions found for this demo user.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {userTransactions.map((tx) => {
              const isPositive = tx.amount > 0;
              return (
                <div
                  key={tx.id}
                  className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        tx.type === 'signup_bonus' || tx.type === 'demo_grant'
                          ? 'bg-amber-50 text-amber-600'
                          : isPositive
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {tx.type === 'signup_bonus' || tx.type === 'demo_grant' ? (
                        <Gift className="w-4 h-4" />
                      ) : isPositive ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{tx.description}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-600 mt-0.5">
                        <span className="capitalize">{tx.type.replace('_', ' ')}</span>
                        <span>·</span>
                        <span>{new Date(tx.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-sm font-black ${
                        isPositive ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isPositive ? `+${tx.amount}` : tx.amount} Credits
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
