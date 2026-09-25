/**
 * The choices the profile form offers for currency and timezone. Both lists come from the
 * platform's own Intl data (`Intl.supportedValuesOf`), so nothing is hand-maintained and no
 * dependency is added (R-P1). The server validates the same two facts — currency as an ISO-4217
 * code, timezone as a zone its runtime knows — so a value chosen here is one the API accepts.
 */

function supported(key: 'currency' | 'timeZone'): readonly string[] {
  try {
    return Intl.supportedValuesOf(key);
  } catch {
    // An older engine without `supportedValuesOf` leaves the select empty rather than throwing;
    // the field keeps the account's existing value either way.
    return [];
  }
}

export const CURRENCY_OPTIONS = supported('currency');
export const TIMEZONE_OPTIONS = supported('timeZone');

const currencyNames = (() => {
  try {
    return new Intl.DisplayNames(undefined, { type: 'currency' });
  } catch {
    return undefined;
  }
})();

/** "USD — US Dollar" where the engine can name the code, else just the code. */
export function currencyLabel(code: string): string {
  const name = currencyNames?.of(code);

  return name !== undefined && name !== code ? `${code} — ${name}` : code;
}
