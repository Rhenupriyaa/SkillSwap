import React from 'react';
import type { ProficiencyLevel } from '../types/index.ts';
import { TrendingUp, Compass, Award } from 'lucide-react';

interface ProficiencyBadgeProps {
  level: ProficiencyLevel;
  showBar?: boolean;
  size?: 'xs' | 'sm' | 'md';
  prefix?: string;
  variant?: 'pill' | 'card-footer';
}

export const ProficiencyBadge: React.FC<ProficiencyBadgeProps> = ({
  level,
  showBar = true,
  size = 'sm',
  prefix,
  variant = 'pill',
}) => {
  const getLevelConfig = () => {
    switch (level) {
      case 'Beginner':
        return {
          label: 'Beginner',
          step: 1,
          percent: 33,
          badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
          barActive: 'bg-emerald-500',
          trackBg: 'bg-emerald-100/60',
          icon: Compass,
          iconColor: 'text-emerald-600',
        };
      case 'Intermediate':
        return {
          label: 'Intermediate',
          step: 2,
          percent: 66,
          badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-200/80',
          barActive: 'bg-indigo-600',
          trackBg: 'bg-indigo-100/60',
          icon: TrendingUp,
          iconColor: 'text-indigo-600',
        };
      case 'Expert':
      default:
        return {
          label: 'Expert',
          step: 3,
          percent: 100,
          badgeBg: 'bg-violet-50 text-violet-900 border-violet-200/80',
          barActive: 'bg-gradient-to-r from-violet-600 to-indigo-600',
          trackBg: 'bg-violet-100/60',
          icon: Award,
          iconColor: 'text-violet-600',
        };
    }
  };

  const config = getLevelConfig();
  const Icon = config.icon;

  if (variant === 'card-footer') {
    return (
      <div className="w-full mt-2 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between text-[11px] mb-1">
          <span className="flex items-center gap-1 font-semibold text-slate-700">
            <Icon className={`w-3 h-3 ${config.iconColor}`} />
            {prefix ? `${prefix} ` : ''}
            <span>{config.label}</span>
          </span>
          <span className="text-[10px] font-bold text-slate-400">
            Level {config.step}/3
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-0.5 p-0.5">
          {[1, 2, 3].map((seg) => (
            <div
              key={seg}
              className={`flex-1 h-full rounded-full transition-all duration-300 ${
                seg <= config.step ? config.barActive : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
  };

  const textSizes = {
    xs: 'px-1.5 py-0.5 text-[9px]',
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <div className="inline-flex items-center gap-1.5 shrink-0">
      <span
        className={`inline-flex items-center gap-1 font-semibold rounded-lg border ${
          config.badgeBg
        } ${textSizes[size]}`}
      >
        <Icon className={`${iconSizes[size]} ${config.iconColor}`} />
        <span>
          {prefix ? `${prefix} ` : ''}
          {config.label}
        </span>
      </span>

      {showBar && (
        <div
          className="flex items-center gap-0.5 bg-slate-100 px-1 py-0.5 rounded-full border border-slate-200/70"
          title={`Proficiency: Level ${config.step} of 3 (${config.label})`}
        >
          {[1, 2, 3].map((seg) => (
            <span
              key={seg}
              className={`w-2 h-1 rounded-full transition-all ${
                seg <= config.step ? config.barActive : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
