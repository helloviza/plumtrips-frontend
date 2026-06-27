import type { Hotel, Room, PreBookResponse } from '../stores/hotelStore';

export interface PriceBreakdown {
  baseFare: number;
  taxes: number;
  totalPayable: number;
}

/** Base fare for a hotel card (cheapest room, full stay). */
export function getHotelBaseFare(hotel: Pick<Hotel, 'price'>): number {
  return hotel.price;
}

/** Taxes & fees for the hotel card's cheapest room (full stay). */
export function getHotelTaxes(hotel: Pick<Hotel, '_taxes'>): number {
  return hotel._taxes ?? 0;
}

/** Online payable total for a hotel card — matches the cheapest room on the Rooms page. */
export function getHotelTotalPayable(hotel: Pick<Hotel, 'price' | '_taxes'>): number {
  return getHotelBaseFare(hotel) + getHotelTaxes(hotel);
}

export function getRoomBaseFare(room: Pick<Room, 'price'>): number {
  return room.price;
}

export function getRoomTaxes(room: Pick<Room, 'taxesAndFees'>): number {
  return room.taxesAndFees ?? 0;
}

/** Online payable for one room line (excludes pay-at-hotel mandatory charges). */
export function getRoomOnlinePayable(room: Pick<Room, 'price' | 'taxesAndFees'>, quantity = 1): number {
  return (getRoomBaseFare(room) + getRoomTaxes(room)) * quantity;
}

export function getRoomsPriceBreakdown(rooms: Room[]): PriceBreakdown {
  const baseFare = rooms.reduce((s, r) => s + getRoomBaseFare(r) * r.quantity, 0);
  const taxes = rooms.reduce((s, r) => s + getRoomTaxes(r) * r.quantity, 0);
  return { baseFare, taxes, totalPayable: baseFare + taxes };
}

export function getRoomsListingTotal(rooms: Room[]): number {
  return getRoomsPriceBreakdown(rooms).totalPayable;
}

/**
 * Resolve online payable from prebook when available, otherwise from search room data.
 * Prebook NetAmount is treated as all-in (taxes included).
 *
 * For multi-room bookings, pass all per-room prebook responses via `preBookResponses`.
 * Falls back gracefully to the single `preBook` (room 0) when only one room is selected.
 */
export function getConfirmedOnlinePayable(
  preBook: PreBookResponse | null | undefined,
  rooms: Room[],
  preBookResponses?: (PreBookResponse | null)[]
): PriceBreakdown & { fromPreBook: boolean } {
  const listing = getRoomsPriceBreakdown(rooms);

  // Multi-room: if we have per-room prebook responses, sum them up
  if (preBookResponses && preBookResponses.length > 1) {
    const responses = preBookResponses.filter((r): r is PreBookResponse => r !== null && r !== undefined);
    if (responses.length === rooms.length) {
      // All rooms have been prebooked — sum confirmed prices
      let totalNetAmount = 0;
      let totalBaseFare = 0;
      let totalTaxes = 0;
      let anyFromPreBook = false;

      for (const res of responses) {
        const netAmount = res.netAmount ?? 0;
        if (netAmount > 0) {
          totalNetAmount += netAmount;
          anyFromPreBook = true;
        } else if (res.confirmedPrice > 0) {
          totalBaseFare += res.confirmedPrice;
          totalTaxes += res.confirmedTaxes ?? 0;
          anyFromPreBook = true;
        }
      }

      if (anyFromPreBook) {
        if (totalNetAmount > 0) {
          return { baseFare: totalNetAmount, taxes: 0, totalPayable: totalNetAmount, fromPreBook: true };
        }
        return { baseFare: totalBaseFare, taxes: totalTaxes, totalPayable: totalBaseFare + totalTaxes, fromPreBook: true };
      }
    }
    // Partial prebooks: fall through to listing total
    return { ...listing, fromPreBook: false };
  }

  // Single-room (legacy) path
  if (!preBook) return { ...listing, fromPreBook: false };

  const netAmount = preBook.netAmount ?? 0;
  if (netAmount > 0) {
    return { baseFare: netAmount, taxes: 0, totalPayable: netAmount, fromPreBook: true };
  }

  if (preBook.confirmedPrice > 0) {
    const taxes = preBook.confirmedTaxes ?? 0;
    return {
      baseFare: preBook.confirmedPrice,
      taxes,
      totalPayable: preBook.confirmedPrice + taxes,
      fromPreBook: true,
    };
  }

  return { ...listing, fromPreBook: false };
}

/** True when supplier flagged a price change and amounts differ from search listing. */
export function hasSupplierPriceChange(
  preBook: PreBookResponse | null | undefined,
  rooms: Room[],
  preBookResponses?: (PreBookResponse | null)[]
): boolean {
  // Multi-room: check if any room has a price change
  if (preBookResponses && preBookResponses.length > 1) {
    const anyChanged = preBookResponses.some(r => r?.priceChanged === true);
    if (!anyChanged) return false;
    const listingTotal = getRoomsListingTotal(rooms);
    const { totalPayable } = getConfirmedOnlinePayable(preBook, rooms, preBookResponses);
    return Math.abs(totalPayable - listingTotal) >= 1;
  }
  if (!preBook?.priceChanged) return false;
  const listingTotal = getRoomsListingTotal(rooms);
  const { totalPayable } = getConfirmedOnlinePayable(preBook, rooms);
  return Math.abs(totalPayable - listingTotal) >= 1;
}

export function getRoomsPayAtHotelTotal(rooms: Room[]): number {
  return rooms.reduce(
    (sum, r) => sum + (r.additionalCharges ?? 0) * r.quantity,
    0
  );
}
