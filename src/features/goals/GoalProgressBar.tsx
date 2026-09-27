import type { Goal } from '@/types/api';

interface GoalProgressBarProps {
  /** Server-computed, already capped at 100 (R-B3); the client only draws it. */
  progressPct: number;
  deadlineStatus: Goal['deadlineStatus'];
  completed: boolean;
}

type GoalState = 'completed' | 'past-deadline' | 'on-track';

const STATE_CONFIG: Record<GoalState, { fillClass: string; badgeClass: string; label: string }> = {
  completed: {
    fillClass: 'bg-income',
    badgeClass: 'border-income/30 bg-income/10 text-income',
    label: 'Completed',
  },
  'past-deadline': {
    fillClass: 'bg-expense',
    badgeClass: 'border-expense/30 bg-expense/10 text-expense',
    label: 'Past deadline',
  },
  'on-track': {
    fillClass: 'bg-brass',
    badgeClass: 'border-brass/30 bg-brass/10 text-brass',
    label: 'On track',
  },
};

/** Completion wins over the deadline: a goal reached late still reads as done, not overdue. */
function goalState(completed: boolean, deadlineStatus: Goal['deadlineStatus']): GoalState {
  if (completed) {
    return 'completed';
  }

  return deadlineStatus === 'past-deadline' ? 'past-deadline' : 'on-track';
}

export function GoalProgressBar({ progressPct, deadlineStatus, completed }: GoalProgressBarProps) {
  const clampedPercent = Math.min(Math.max(progressPct, 0), 100);
  const config = STATE_CONFIG[goalState(completed, deadlineStatus)];

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between text-xs text-muted">
        <span className="font-medium text-ink">{progressPct.toFixed(1)}%</span>
        <span
          className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-medium ${config.badgeClass}`}
        >
          {config.label}
        </span>
      </div>

      <div
        role="progressbar"
        aria-valuenow={progressPct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Goal progress: ${progressPct.toFixed(1)}% saved`}
        className="h-2 w-full overflow-hidden rounded-full bg-line/40"
      >
        <div
          className={`h-full rounded-full transition-all duration-200 ${config.fillClass}`}
          style={{ width: `${clampedPercent}%` }}
        />
      </div>
    </div>
  );
}
