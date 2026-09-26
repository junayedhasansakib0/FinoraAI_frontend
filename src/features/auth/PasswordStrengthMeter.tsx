import { PASSWORD_RULES, passwordStrength, unmetPasswordRules } from './schemas';

/**
 * The live password strength hint shown beneath the register (and change-password) field. It is a
 * hint only — the server is the authority (R-V1) — so it renders nothing until the person starts
 * typing, then grades what they have and lists the rules still unmet. It reads the same
 * `PASSWORD_RULES` the schema validates against, so the meter and the rejection never disagree.
 */

const STRENGTH_LABEL = { weak: 'Weak', fair: 'Fair', strong: 'Strong' } as const;

/** The filled portion of the bar and the label colour, by grade. */
const STRENGTH_TONE = {
  weak: { bars: 2, text: 'text-expense', fill: 'bg-expense' },
  fair: { bars: 4, text: 'text-ink', fill: 'bg-ink' },
  strong: { bars: 5, text: 'text-income', fill: 'bg-income' },
} as const;

export function PasswordStrengthMeter({ password }: { password: string }) {
  if (password.length === 0) {
    return null;
  }

  const grade = passwordStrength(password);
  const tone = STRENGTH_TONE[grade];
  const unmet = new Set(unmetPasswordRules(password).map((rule) => rule.label));

  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex flex-1 gap-1" aria-hidden="true">
          {PASSWORD_RULES.map((rule, index) => (
            <span
              key={rule.label}
              className={`h-1 flex-1 ${index < tone.bars ? tone.fill : 'bg-line'}`}
            />
          ))}
        </div>
        <p className={`text-sm font-medium ${tone.text}`} role="status">
          {STRENGTH_LABEL[grade]}
        </p>
      </div>

      <ul className="space-y-1">
        {PASSWORD_RULES.map((rule) => {
          const met = !unmet.has(rule.label);

          return (
            <li key={rule.label} className="text-sm">
              <span aria-hidden="true" className={met ? 'text-income' : 'text-muted'}>
                {met ? '✓' : '○'}
              </span>{' '}
              <span className={met ? 'text-ink' : 'text-muted'}>{rule.label}</span>
              <span className="sr-only">{met ? ' — met' : ' — not met'}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
