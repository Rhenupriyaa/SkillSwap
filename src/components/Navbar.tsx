import React, { useState } from 'react';
import { useSkillSwap } from '../context/SkillSwapContext.tsx';
import { SkillSwapLogo } from './SkillSwapLogo.tsx';
import {
  Sparkles,
  Coins,
  RotateCcw,
  UserCheck,
  ChevronDown,
  Menu,
  X,
  PlusCircle,
  Radio,
  LogIn,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    users,
    currentUserId,
    currentUser,
    switchUser,
    addDemoCredits,
    resetDemoData,
    activeTab,
    setActiveTab,
    requests,
    sessions,
    firebaseUser,
    loginWithGoogle,
    logout,
    openVoicePractice,
  } = useSkillSwap();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Pending incoming requests count
  const pendingIncoming = requests.filter(
    (r) => r.toUserId === currentUserId && r.status === 'pending'
  ).length;

  // Upcoming sessions count
  const upcomingCount = sessions.filter(
    (s) =>
      (s.teacherId === currentUserId || s.learnerId === currentUserId) &&
      s.status === 'upcoming'
  ).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'discover', label: 'Find Teachers' },
    { id: 'matches', label: 'Direct Matches' },
    { id: 'requests', label: 'Requests', badge: pendingIncoming > 0 ? pendingIncoming : undefined },
    { id: 'sessions', label: 'Sessions', badge: upcomingCount > 0 ? upcomingCount : undefined },
    { id: 'chains', label: 'Chain Finder' },
    { id: 'credits', label: 'Skill Credits' },
    { id: 'profile', label: 'My Skills' },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo with Custom SkillSwap Logo */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
              aria-label="SkillSwap Home"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200 group-hover:scale-105 transition-transform">
                <SkillSwapLogo className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-slate-900 tracking-tight block leading-none">
                  Skill<span className="text-indigo-600">Swap</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-500 block mt-0.5 tracking-wider uppercase">
                  Learn by Exchange
                </span>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all relative ${
                      isActive
                        ? 'text-indigo-700 bg-indigo-50/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    {item.label}
                    {item.badge !== undefined && (
                      <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-600 text-white">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Controls: Voice Live API + Credit Balance + Auth & Demo Switcher */}
          <div className="flex items-center gap-2.5">
            {/* Live API Voice Conversation Button */}
            <button
              onClick={() => openVoicePractice()}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-bold shadow-xs shadow-violet-200 transition-all flex items-center gap-1.5 active:scale-98"
            >
              <Radio className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span className="hidden sm:inline">Voice Tutor</span>
              <span className="text-[10px] px-1 py-0.2 bg-white/20 rounded font-normal hidden md:inline">
                Live
              </span>
            </button>

            {/* Credit Badge */}
            <div className="flex items-center bg-amber-50 border border-amber-200/80 rounded-xl px-2.5 py-1.5 shadow-2xs">
              <Coins className="w-3.5 h-3.5 text-amber-600 mr-1.5" />
              <div className="text-xs">
                <span className="text-amber-700 font-medium hidden sm:inline">Credits: </span>
                <span className="font-extrabold text-amber-900">{currentUser.credits}</span>
              </div>
              <button
                onClick={() => addDemoCredits(2)}
                title="Top-up +2 Demo Credits"
                className="ml-1.5 text-amber-600 hover:text-amber-800 transition-colors p-0.5 rounded hover:bg-amber-100"
              >
                <PlusCircle className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Google Sign-In or User Profile */}
            {firebaseUser ? (
              <div className="flex items-center gap-1.5 pl-1">
                <img
                  src={firebaseUser.photoURL || currentUser.avatar}
                  alt={firebaseUser.displayName || 'Google User'}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-400"
                />
                <button
                  onClick={logout}
                  title="Sign out of Firebase"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={loginWithGoogle}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-2xs"
                title="Sign in with Google Firebase Auth"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google</span>
              </button>
            )}

            {/* Demo User Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-left"
                aria-label="Switch demo user"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-indigo-200"
                />
                <div className="hidden md:block text-left">
                  <div className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[90px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-indigo-600 font-medium">
                    {firebaseUser ? 'Google User' : 'Demo Role'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-72 rounded-2xl bg-white shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-700">Demo Role Switcher</p>
                    <p className="text-[11px] text-slate-600">
                      Switch personas to test request flows & direct swaps:
                    </p>
                  </div>

                  <div className="max-h-64 overflow-y-auto py-1">
                    {users.map((u) => {
                      const isSelected = u.id === currentUserId;
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchUser(u.id);
                            setUserDropdownOpen(false);
                          }}
                          className={`w-full px-3.5 py-2 text-left flex items-center gap-2.5 hover:bg-slate-50 transition-colors ${
                            isSelected ? 'bg-indigo-50/70 text-indigo-900 font-medium' : 'text-slate-700'
                          }`}
                        >
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold flex items-center justify-between">
                              <span className="truncate">{u.name}</span>
                              {isSelected && (
                                <UserCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0 ml-1" />
                              )}
                            </div>
                            <div className="text-[11px] text-slate-600 truncate">
                              Teaches: {u.skillsTeaching[0]?.name || 'Nothing yet'}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="border-t border-slate-100 pt-2 px-3">
                    <button
                      onClick={() => {
                        if (confirm('Reset demo data to initial state?')) {
                          resetDemoData();
                          setUserDropdownOpen(false);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors font-medium"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset Demo Data
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          <button
            onClick={() => {
              openVoicePractice();
              setMobileMenuOpen(false);
            }}
            className="w-full mb-2 px-3 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-300 animate-pulse" />
              Gemini 3.8 Live Voice Tutor
            </span>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded">Live</span>
          </button>

          {!firebaseUser && (
            <button
              onClick={() => {
                loginWithGoogle();
                setMobileMenuOpen(false);
              }}
              className="w-full mb-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-bold text-xs flex items-center gap-2"
            >
              <LogIn className="w-4 h-4 text-indigo-600" />
              Sign in with Google (Firebase)
            </button>
          )}

          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${
                activeTab === item.id
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full bg-indigo-600 text-white">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
