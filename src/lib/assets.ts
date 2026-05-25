import destBali from "@assets/dest-bali.png";
import destItaly from "@assets/dest-italy.png";
import destJapan from "@assets/dest-japan.png";
import destThailand from "@assets/dest-thailand.png";
import expDubai from "@assets/exp-dubai.png";
import expIceland from "@assets/exp-iceland.png";
import expThailand from "@assets/exp-thailand.png";
import expTokyo from "@assets/exp-tokyo.png";
import expTuscany from "@assets/exp-tuscany.png";
import heroBg from "@assets/hero-bg.png";
import logo from "@assets/logo.png";

export const assets: Record<string, string> = {
  "@assets/dest-bali.png": destBali,
  "@assets/dest-italy.png": destItaly,
  "@assets/dest-japan.png": destJapan,
  "@assets/dest-thailand.png": destThailand,
  "@assets/exp-dubai.png": expDubai,
  "@assets/exp-iceland.png": expIceland,
  "@assets/exp-thailand.png": expThailand,
  "@assets/exp-tokyo.png": expTokyo,
  "@assets/exp-tuscany.png": expTuscany,
  "@assets/hero-bg.png": heroBg,
  "@assets/logo.png": logo,
};

export function getAssetUrl(path: string | undefined): string {
  if (!path) return '';
  const cleanPath = path.trim();
  if (assets[cleanPath]) return assets[cleanPath];
  
  // Fallback: try to find a matching key
  for (const [key, value] of Object.entries(assets)) {
    if (cleanPath.includes(key) || key.includes(cleanPath)) {
      return value;
    }
  }
  
  return cleanPath;
}
