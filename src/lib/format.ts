function padToTwo(value: number): string {
  return value.toString().padStart(2, '0');
}

/** Uptime as a fixed-width hh:mm:ss clock so successive readings align in a ledger column. */
export function formatUptime(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return '—';
  }

  const whole = Math.floor(totalSeconds);
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);

  return `${padToTwo(hours)}:${padToTwo(minutes)}:${padToTwo(whole % 60)}`;
}

/** Server timestamps are ISO-8601; rendering them in UTC makes clock skew visible. */
export function formatServerTime(isoTimestamp: string): string {
  const parsed = new Date(isoTimestamp);

  if (Number.isNaN(parsed.getTime())) {
    return '—';
  }

  return `${parsed.toISOString().slice(0, 19).replace('T', ' ')} UTC`;
}
