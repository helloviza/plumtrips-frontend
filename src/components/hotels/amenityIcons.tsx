/**
 * Comprehensive amenity → Lucide icon map.
 * Keys are matched case-insensitively via getAmenityIcon().
 */
import React from 'react';
import {
  Wifi, Dumbbell, UtensilsCrossed, Car, Waves, Coffee,
  Wind, Flame, Shirt, Tv, Phone, CreditCard, BriefcaseMedical,
  ConciergeBell, ShowerHead, Bath, Bed, Lock, Bike,
  ParkingCircle, Bus, Plane, Ship, Trees, Sun,
  Baby, Dog, Cigarette, CigaretteOff, Accessibility,
  ChefHat, Wine, Utensils, Beer, IceCream,
  Dices, Music, Gamepad2, Theater,
  FlameKindling, Thermometer, Snowflake,
  Shield, Clock, Key, Building2, Star,
  MapPin, Sparkles, Heart, Zap,
} from 'lucide-react';

type IconSize = 'sm' | 'md' | 'lg';

const SIZE: Record<IconSize, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

/**
 * Ordered list of [keyword, icon factory].
 * First match wins, so put more specific strings first.
 */
const RULES: [string, (cls: string) => React.ReactNode][] = [
  // ── Connectivity ──────────────────────────────────────────────────────
  ['wifi',              (c) => <Wifi className={c} />],
  ['internet',          (c) => <Wifi className={c} />],

  // ── Food & Drink ──────────────────────────────────────────────────────
  ['breakfast',         (c) => <Coffee className={c} />],
  ['brunch',            (c) => <Coffee className={c} />],
  ['all inclusive',     (c) => <Utensils className={c} />],
  ['full board',        (c) => <Utensils className={c} />],
  ['half board',        (c) => <Utensils className={c} />],
  ['restaurant',        (c) => <UtensilsCrossed className={c} />],
  ['dining',            (c) => <UtensilsCrossed className={c} />],
  ['kitchen',           (c) => <ChefHat className={c} />],
  ['kitchenette',       (c) => <ChefHat className={c} />],
  ['minibar',           (c) => <Wine className={c} />],
  ['bar',               (c) => <Wine className={c} />],
  ['wine',              (c) => <Wine className={c} />],
  ['coffee',            (c) => <Coffee className={c} />],
  ['tea',               (c) => <Coffee className={c} />],
  ['beer',              (c) => <Beer className={c} />],
  ['ice cream',         (c) => <IceCream className={c} />],

  // ── Pool & Spa ────────────────────────────────────────────────────────
  ['pool',              (c) => <Waves className={c} />],
  ['swim',              (c) => <Waves className={c} />],
  ['jacuzzi',           (c) => <Bath className={c} />],
  ['hot tub',           (c) => <Bath className={c} />],
  ['spa',               (c) => <Sparkles className={c} />],
  ['massage',           (c) => <Sparkles className={c} />],
  ['sauna',             (c) => <FlameKindling className={c} />],
  ['steam',             (c) => <FlameKindling className={c} />],
  ['beach',             (c) => <Sun className={c} />],
  ['sun',               (c) => <Sun className={c} />],

  // ── Fitness ───────────────────────────────────────────────────────────
  ['gym',               (c) => <Dumbbell className={c} />],
  ['fitness',           (c) => <Dumbbell className={c} />],
  ['sport',             (c) => <Dumbbell className={c} />],
  ['yoga',              (c) => <Heart className={c} />],
  ['bicycle',           (c) => <Bike className={c} />],
  ['bike',              (c) => <Bike className={c} />],
  ['cycling',           (c) => <Bike className={c} />],

  // ── Parking & Transport ───────────────────────────────────────────────
  ['valet',             (c) => <Car className={c} />],
  ['parking',           (c) => <ParkingCircle className={c} />],
  ['car',               (c) => <Car className={c} />],
  ['shuttle',           (c) => <Bus className={c} />],
  ['airport transfer',  (c) => <Plane className={c} />],
  ['airport',           (c) => <Plane className={c} />],
  ['cruise',            (c) => <Ship className={c} />],
  ['bus',               (c) => <Bus className={c} />],

  // ── Room features ─────────────────────────────────────────────────────
  ['air condition',     (c) => <Snowflake className={c} />],
  ['ac',                (c) => <Snowflake className={c} />],
  ['heating',           (c) => <Thermometer className={c} />],
  ['fan',               (c) => <Wind className={c} />],
  ['fireplace',         (c) => <Flame className={c} />],
  ['tv',                (c) => <Tv className={c} />],
  ['television',        (c) => <Tv className={c} />],
  ['telephone',         (c) => <Phone className={c} />],
  ['balcony',           (c) => <Trees className={c} />],
  ['terrace',           (c) => <Trees className={c} />],
  ['garden',            (c) => <Trees className={c} />],
  ['view',              (c) => <MapPin className={c} />],
  ['safe',              (c) => <Lock className={c} />],
  ['locker',            (c) => <Lock className={c} />],
  ['shower',            (c) => <ShowerHead className={c} />],
  ['bathroom',          (c) => <Bath className={c} />],
  ['bath',              (c) => <Bath className={c} />],
  ['bed',               (c) => <Bed className={c} />],

  // ── Services ──────────────────────────────────────────────────────────
  ['concierge',         (c) => <ConciergeBell className={c} />],
  ['room service',      (c) => <ConciergeBell className={c} />],
  ['reception',         (c) => <ConciergeBell className={c} />],
  ['front desk',        (c) => <ConciergeBell className={c} />],
  ['24',                (c) => <Clock className={c} />],
  ['laundry',           (c) => <Shirt className={c} />],
  ['dry clean',         (c) => <Shirt className={c} />],
  ['ironing',           (c) => <Shirt className={c} />],
  ['housekeeping',      (c) => <Shirt className={c} />],
  ['medical',           (c) => <BriefcaseMedical className={c} />],
  ['first aid',         (c) => <BriefcaseMedical className={c} />],
  ['doctor',            (c) => <BriefcaseMedical className={c} />],
  ['credit card',       (c) => <CreditCard className={c} />],
  ['payment',           (c) => <CreditCard className={c} />],
  ['security',          (c) => <Shield className={c} />],
  ['cctv',              (c) => <Shield className={c} />],
  ['check-in',          (c) => <Key className={c} />],
  ['key',               (c) => <Key className={c} />],
  ['elevator',          (c) => <Building2 className={c} />],
  ['lift',              (c) => <Building2 className={c} />],
  ['electric',          (c) => <Zap className={c} />],

  // ── Entertainment ─────────────────────────────────────────────────────
  ['casino',            (c) => <Dices className={c} />],
  ['game',              (c) => <Gamepad2 className={c} />],
  ['music',             (c) => <Music className={c} />],
  ['nightclub',         (c) => <Music className={c} />],
  ['theatre',           (c) => <Theater className={c} />],
  ['theater',           (c) => <Theater className={c} />],
  ['cinema',            (c) => <Theater className={c} />],

  // ── Family & Accessibility ────────────────────────────────────────────
  ['kids',              (c) => <Baby className={c} />],
  ['children',          (c) => <Baby className={c} />],
  ['baby',              (c) => <Baby className={c} />],
  ['playground',        (c) => <Baby className={c} />],
  ['pet',               (c) => <Dog className={c} />],
  ['dog',               (c) => <Dog className={c} />],
  ['accessible',        (c) => <Accessibility className={c} />],
  ['wheelchair',        (c) => <Accessibility className={c} />],
  ['disabled',          (c) => <Accessibility className={c} />],
  ['handicap',          (c) => <Accessibility className={c} />],

  // ── Smoking ───────────────────────────────────────────────────────────
  ['non-smoking',       (c) => <CigaretteOff className={c} />],
  ['no smoking',        (c) => <CigaretteOff className={c} />],
  ['non smoking',       (c) => <CigaretteOff className={c} />],
  ['smoking',           (c) => <Cigarette className={c} />],

  // ── Catch-all ────────────────────────────────────────────────────────
  ['star',              (c) => <Star className={c} />],
];

export function getAmenityIcon(name: string, size: IconSize = 'md'): React.ReactNode {
  const lower = name.toLowerCase();
  const cls = SIZE[size];
  for (const [keyword, factory] of RULES) {
    if (lower.includes(keyword)) return factory(cls);
  }
  // Generic dot fallback — no more CheckCircle
  return (
    <span
      style={{
        display: 'inline-block',
        width: size === 'sm' ? 6 : size === 'lg' ? 8 : 7,
        height: size === 'sm' ? 6 : size === 'lg' ? 8 : 7,
        borderRadius: '50%',
        background: 'currentColor',
        opacity: 0.35,
        flexShrink: 0,
      }}
    />
  );
}
