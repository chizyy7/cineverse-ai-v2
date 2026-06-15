'use client';

import { motion } from 'framer-motion';
import { getLevelForXP } from '@/lib/achievements';

interface XPBarProps {
  xp: number;
  showLevel?: boolean;
  compact?: boolean;
}

export default function XPBar({ xp, showLevel = true, compact = false }: XPBarProps) {
  const levelInfo = getLevelForXP(xp);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {showLevel && (
          <span className="text-xs font-semibold text-accent-gold">Lv.{levelInfo.level}</span>
        )}
        <div className="flex-1 h-1.5 bg-background-tertiary rounded-full overflow-hidden min-w-[60px]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${levelInfo.progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-accent-blue to-accent-purple rounded-full"
          />
        </div>
        <span className="text-[10px] text-text-tertiary">
          {levelInfo.currentXP}/{levelInfo.nextThreshold}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-background-secondary/80 backdrop-blur-sm border border-accent-blue/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏆</span>
          <div>
            <p className="text-sm font-semibold text-text-primary">Level {levelInfo.level}</p>
            <p className="text-xs text-text-tertiary">{levelInfo.name}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-accent-gold">{xp.toLocaleString()} XP</p>
          <p className="text-xs text-text-tertiary">
            {levelInfo.nextThreshold - levelInfo.currentXP} XP to next level
          </p>
        </div>
      </div>

      <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${levelInfo.progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-accent-blue to-accent-purple rounded-full"
        />
      </div>

      <div className="flex justify-between mt-1 text-[10px] text-text-tertiary">
        <span>Level {levelInfo.level}</span>
        <span>Level {levelInfo.level + 1}</span>
      </div>
    </div>
  );
}
