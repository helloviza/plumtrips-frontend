import { useCurrencyStore, REGIONS } from '../stores/currencyStore';
import { useCallback, useEffect } from 'react';

export { REGIONS };

export function useCurrency() {
  const { regionId, setRegion, rates, fetchRates } = useCurrencyStore();
  const currentRegion = REGIONS.find((r) => r.id === regionId) || REGIONS[0];

  // Fetch rates once on mount if they are just the default { INR: 1 }
  useEffect(() => {
    if (Object.keys(rates).length <= 1) {
      fetchRates();
    }
  }, [rates, fetchRates]);

  const convertCurrency = useCallback(
    (amountInINR: number): number => {
      const rate = rates[currentRegion.code] || 1;
      return amountInINR * rate;
    },
    [rates, currentRegion.code]
  );

  const convertBackToInr = useCallback(
    (amountInCurrent: number): number => {
      const rate = rates[currentRegion.code] || 1;
      return amountInCurrent / rate;
    },
    [rates, currentRegion.code]
  );

  const formatCurrency = useCallback(
    (amountInINR: number): string => {
      const converted = convertCurrency(amountInINR);
      
      // Determine locale based on currency for native formatting
      let locale = 'en-IN';
      if (currentRegion.code === 'USD') locale = 'en-US';
      if (currentRegion.code === 'AED') locale = 'ar-AE';
      if (currentRegion.code === 'VND') locale = 'vi-VN';

      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currentRegion.code,
        maximumFractionDigits: 0, // Most travel sites omit decimals for large amounts
      }).format(converted);
    },
    [convertCurrency, currentRegion.code]
  );

  return {
    regionId,
    setRegion,
    currencyCode: currentRegion.code,
    symbol: currentRegion.symbol,
    convertCurrency,
    formatCurrency,
    convertBackToInr
  };
}
