import { createContext, useContext, useEffect, useState, } from "react";
import type { ReactNode } from "react";

// Map your region IDs to ISO currency codes
export const REGION_CURRENCY: Record<string, string> = {
  IN: "INR",
  AE: "AED",
  VN: "VND",
  US: "USD",
};

// Currency symbols for display
const SYMBOLS: Record<string, string> = {
  INR: "₹",
  AED: "د.إ",
  VND: "₫",
  USD: "$",
};

interface CurrencyContextValue {
  currency: string;          // e.g. "INR"
  symbol: string;            // e.g. "₹"
  setCurrency: (c: string) => void;
  convert: (amountInINR: number, fromCurrency?: string) => string;
  rates: Record<string, number>; // live rates (base = INR)
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState("INR");
  const [rates, setRates] = useState<Record<string, number>>({ INR: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Free API — no key required, 1500 req/month on free tier
    // Base = INR, so rates tell you: 1 INR = X of each currency
    fetch("https://open.er-api.com/v6/latest/INR")
      .then((r) => r.json())
      .then((data) => {
        if (data.rates) {
          setRates(data.rates);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  /**
   * Convert an amount to the currently selected currency.
   *
   * @param amount        — numeric amount
   * @param fromCurrency  — the currency the amount is already in (default: "INR")
   * @returns             — formatted string like "₹4,999" or "$59.87"
   */
  const convert = (amount: number, fromCurrency = "INR"): string => {
    if (loading || !rates[currency] || !rates[fromCurrency]) {
      // Fallback: just format in the source currency
      return `${SYMBOLS[fromCurrency] ?? fromCurrency} ${amount.toLocaleString()}`;
    }

    // Convert: amount in fromCurrency → INR → target currency
    const inINR = fromCurrency === "INR" ? amount : amount / rates[fromCurrency];
    const converted = inINR * rates[currency];

    return new Intl.NumberFormat(localeFor(currency), {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "VND" ? 0 : 2,
      minimumFractionDigits: currency === "VND" ? 0 : 0,
    }).format(converted);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        symbol: SYMBOLS[currency] ?? currency,
        setCurrency,
        convert,
        rates,
        loading,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used inside <CurrencyProvider>");
  return ctx;
}

function localeFor(currency: string) {
  const map: Record<string, string> = {
    INR: "en-IN",
    AED: "ar-AE",
    VND: "vi-VN",
    USD: "en-US",
  };
  return map[currency] ?? "en-US";
}