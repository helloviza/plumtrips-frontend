// apps/frontend/src/pages/flights/Fare.tsx
import React from "react";
import { useSearchParams } from "react-router-dom";
import {
  tboFareQuote,
  tboFareRule,
  tboBook,
  tboTicket,
  tboGetBookingDetails,
} from "../../lib/api";
import type { BookBody } from "../../lib/api";

/* -------- session fallbacks (if user refreshes) -------- */
function readSelectedResultIndex(): string {
  try {
    const raw = sessionStorage.getItem("plumtrips.selectedFlight");
    if (!raw) return "";
    const parsed = JSON.parse(raw);
    return String(parsed?.flight?.id || "");
  } catch {
    return "";
  }
}
function readSearchTraceId(): string {
  try {
    const t = sessionStorage.getItem("plumtrips.traceId");
    return t ? String(t) : "";
  } catch {
    return "";
  }
}

/* -------- tiny helpers to read legs from a TBO quote -------- */
function legsFromQuote(q: any): any[] {
  const s = q?.Segments;
  if (!s) return [];
  // Shapes seen from TBO: [ [leg,leg] ] or [leg,leg]
  if (Array.isArray(s) && Array.isArray(s[0])) return s[0] as any[];
  if (Array.isArray(s)) return s as any[];
  return [];
}

export default function FarePage() {
  const [sp] = useSearchParams();

  // Accept multiple spellings & fall back to sessionStorage
  const traceId = sp.get("traceId") || sp.get("t") || readSearchTraceId();
  const resultIndex = sp.get("resultIndex") || sp.get("ri") || readSelectedResultIndex();

  const [loading, setLoading] = React.useState(true);
  const [fatalErr, setFatalErr] = React.useState<string | null>(null);

  const [quote, setQuote] = React.useState<any>(null);
  const [ruleHtml, setRuleHtml] = React.useState<string>("");
  const [ruleErr, setRuleErr] = React.useState<string | null>(null);

  // Booking & ticketing state
  const [bookLoading, setBookLoading] = React.useState(false);
  const [bookingId, setBookingId] = React.useState<number | null>(null);
  const [pnr, setPNR] = React.useState<string>("");

  const [ticketLoading, setTicketLoading] = React.useState(false);
  const [ticketErr, setTicketErr] = React.useState<string | null>(null);
  const [ticketOk, setTicketOk] = React.useState(false);

  const [details, setDetails] = React.useState<any>(null);
  const [detailsLoading, setDetailsLoading] = React.useState(false);

  // Diagnostics
  const [lastTicketPath, setLastTicketPath] = React.useState<"AUTO" | "GDS" | "LCC" | null>(null);

  // Passenger + address form (1 adult demo)
  const [form, setForm] = React.useState({
    Title: "Mr",
    FirstName: "TESTFN",
    LastName: "TESTLN",
    DateOfBirth: "1990-01-01",
    Gender: "1",
    Email: "passenger1@plumtrips.test",
    Mobile: "9999999999",

    // Address fields required by some LCCs (must be present on each pax; backend will copy)
    AddressLine1: "123 Test Street",
    AddressLine2: "",
    City: "Delhi",
    CountryCode: "IN",
    ZipCode: "110001",
  });
  const update = <K extends keyof typeof form>(k: K, v: any) =>
    setForm((s) => ({ ...s, [k]: v }));

  // Load FareQuote (required) + FareRule (optional, non-blocking)
  React.useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setFatalErr(null);
      setRuleErr(null);

      if (!traceId || !resultIndex) {
        setFatalErr("Missing traceId or resultIndex. Please go back and select a flight again.");
        setLoading(false);
        return;
      }

      try {
        const [fqRes, frRes] = await Promise.allSettled([
          tboFareQuote({ traceId, resultIndex }),
          tboFareRule({ traceId, resultIndex }),
        ]);

        if (!alive) return;

        if (fqRes.status === "fulfilled") {
          const fq = fqRes.value?.data?.Response?.Results;
          if (!fq) throw new Error("No FareQuote results");
          setQuote(fq);
        } else {
          throw fqRes.reason;
        }

        if (frRes.status === "fulfilled") {
          const html = frRes.value?.data?.Response?.FareRules?.[0]?.FareRuleDetail || "";
          setRuleHtml(html);
        } else {
          setRuleErr(frRes.reason?.message || "Failed to load fare rules (timeout).");
        }
      } catch (e: any) {
        setFatalErr(e?.message || "Failed to load fare.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [traceId, resultIndex]);

  async function refetchRules() {
    setRuleErr(null);
    try {
      const fr = await tboFareRule({ traceId, resultIndex });
      const html = fr?.data?.Response?.FareRules?.[0]?.FareRuleDetail || "";
      setRuleHtml(html);
    } catch (e: any) {
      setRuleErr(e?.message || "Failed to load fare rules.");
    }
  }

  async function onBook(e: React.FormEvent) {
    e.preventDefault();
    if (!traceId || !resultIndex) {
      setFatalErr("Missing traceId or resultIndex.");
      return;
    }
    if (!form.AddressLine1.trim()) {
      setFatalErr("Passenger address is required (AddressLine1).");
      return;
    }

    setBookLoading(true);
    setTicketErr(null);
    setTicketOk(false);
    setDetails(null);

    try {
      const body: BookBody = {
        traceId,
        resultIndex,
        isLCC: Boolean((quote as any)?.IsLCC) || false,
        blockedFare: false,
        contact: { Email: form.Email, Mobile: form.Mobile },
        // IMPORTANT: provide AddressLine1/2 so backend can copy onto each passenger
        address: {
          AddressLine: form.AddressLine1,   // some flows expect AddressLine at top-level
          AddressLine1: form.AddressLine1,  // backend maps this onto pax
          AddressLine2: form.AddressLine2,
          City: form.City,
          CountryCode: form.CountryCode,
          ZipCode: form.ZipCode,
        },
        passengers: [
          {
            Title: form.Title as "Mr" | "Ms" | "Mrs" | "Mstr" | "Miss",
            FirstName: form.FirstName.trim().toUpperCase(),
            LastName: form.LastName.trim().toUpperCase(),
            PaxType: 1,
            DateOfBirth: `${form.DateOfBirth}T00:00:00`,
            Gender: Number(form.Gender) as 1 | 2,
            ContactNo: form.Mobile,
            Email: form.Email,
          },
        ],
      };

      const br = await tboBook(body);
      const resp = br?.data?.Response;
      const bid = resp?.Response?.BookingId || resp?.BookingId;
      const p = resp?.Response?.PNR || resp?.PNR || "";

      setBookingId(bid ?? null);
      setPNR(p || "");
    } catch (e: any) {
      setFatalErr(e?.message || "Booking failed.");
    } finally {
      setBookLoading(false);
    }
  }

  /**
   * Issue ticket.
   * `forcePath`: "GDS" to force classic flow, "LCC" to force extended flow, or undefined for auto.
   */
  async function attemptTicket(forcePath?: "GDS" | "LCC") {
    if (!traceId) {
      setTicketErr("Missing traceId for ticketing.");
      return;
    }

    const id = bookingId!;
    const pp = pnr || undefined;

    setTicketLoading(true);
    setTicketErr(null);
    setTicketOk(false);

    const isLccFare = Boolean(quote?.IsLCC);
    const pathToUse: "GDS" | "LCC" =
      forcePath ?? (isLccFare ? "LCC" : "GDS");
    setLastTicketPath(forcePath ? forcePath : "AUTO");

    try {
      if (pathToUse === "GDS") {
        if (!id) {
          setTicketErr("No BookingId to ticket.");
          return;
        }
        const body = { bookingId: id, pnr: pp, traceId };
        console.log("[Ticket/GDS] payload →", body);
        await tboTicket(body);
        setTicketOk(true);
        await refreshDetails(id);
        return;
      }

      // LCC path → build per-passenger payload + zero ancillaries
      const cur = String(quote?.Fare?.Currency || "INR");
      const legs = legsFromQuote(quote);

      const mapLeg = (code: "NoBaggage" | "NoMeal" | "NoSeat") =>
        legs.map((leg: any) => {
          const air = leg?.Airline ?? {};
          const org = leg?.Origin ?? leg?.Source ?? {};
          const dst = leg?.Destination ?? leg?.Destination ?? {};
          return {
            AirlineCode: air?.AirlineCode ?? air?.OperatingCarrier ?? "",
            FlightNumber: air?.FlightNumber ?? leg?.FlightNumber ?? "",
            WayType: 2,
            Code: code,
            Description: 2,
            Origin: org?.AirportCode ?? org?.CityCode ?? "",
            Destination: dst?.AirportCode ?? dst?.CityCode ?? "",
            Currency: cur,
            Price: 0,
            SeatWayType: 2,
            AvailablityType: 0,
            RowNo: "0",
            SeatNo: null,
            SeatType: 0,
            Compartment: 0,
            Deck: 0,
            Weight: 0,
            Quantity: 0,
          };
        });

      const adt = (quote?.FareBreakdown || []).find((x: any) => x?.PassengerType === 1);
      const base = Number(adt?.BaseFare ?? quote?.Fare?.BaseFare ?? 0);
      const tax = Number(adt?.Tax ?? quote?.Fare?.Tax ?? 0);

      const passengers = [
        {
          Title: (form.Title as any) || "Mr",
          FirstName: form.FirstName.trim().toUpperCase(),
          LastName: form.LastName.trim().toUpperCase(),
          PaxType: 1 as 1,
          DateOfBirth: `${form.DateOfBirth}T00:00:00`,
          Gender: Number(form.Gender) as 1 | 2,
          AddressLine1: form.AddressLine1 || "Address Required",
          Fare: {
            BaseFare: base,
            Tax: tax,
            YQTax: 0,
            AdditionalTxnFeePub: 0,
            AdditionalTxnFeeOfrd: 0,
            OtherCharges: 0,
          },
          City: form.City || "Delhi",
          CountryCode: form.CountryCode || "IN",
          CountryName: "India",
          Nationality: "IN",
          ContactNo: form.Mobile,
          Email: form.Email,
          IsLeadPax: true,
          Baggage: mapLeg("NoBaggage"),
          MealDynamic: mapLeg("NoMeal"),
          SeatDynamic: mapLeg("NoSeat"),
          SpecialServices: [],
          FFAirlineCode: null,
          FFNumber: null,
        },
      ];

      const agentRef = `PT-${Date.now()}`;
      const body = {
        isLCC: true,
        traceId,
        resultIndex,
        agentReferenceNo: agentRef,
        preferredCurrency: null,
        passengers,
      } as any;

      console.log("[Ticket/LCC] payload →", body);
      await tboTicket(body);

      setTicketOk(true);
      if (id) await refreshDetails(id);
    } catch (e: any) {
      setTicketErr(e?.message || "Ticketing failed from supplier side.");
    } finally {
      setTicketLoading(false);
    }
  }

  async function refreshDetails(bid?: number | string) {
    const id = (bid ?? bookingId)!;
    if (!id) {
      setTicketErr("No BookingId to refresh.");
      return;
    }
    setDetailsLoading(true);
    try {
      const gbd = await tboGetBookingDetails({ bookingId: id });
      setDetails(gbd?.data?.Response || gbd?.data);
    } catch (e: any) {
      setTicketErr(e?.message || "Could not refresh booking details.");
    } finally {
      setDetailsLoading(false);
    }
  }

  const isLccFare = Boolean(quote?.IsLCC);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold mb-2">Fare &amp; Book</h1>
      <div className="text-xs opacity-70 mb-4">
        TraceId: {(traceId || "—").toString().slice(0, 16)}… {" | "}
        ResultIndex: {(resultIndex || "—").toString().slice(0, 16)}…
      </div>

      {fatalErr && (
        <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          {fatalErr}
        </div>
      )}

      {loading && <div className="rounded border p-3">Loading fare…</div>}

      {!loading && quote && (
        <div className="space-y-4">
          {/* Price summary */}
          <div className="rounded border p-3">
            <div className="font-medium mb-2">Price</div>
            <div className="text-sm">
              Currency: {quote?.Fare?.Currency} | Published: {quote?.Fare?.PublishedFare} | Base: {quote?.Fare?.BaseFare} | Tax: {quote?.Fare?.Tax}
            </div>
            <div className="text-sm">
              IsLCC: {String(quote?.IsLCC)} | Refundable: {String(quote?.IsRefundable)}
            </div>
          </div>

          {/* Fare rules (optional) */}
          <details className="rounded border p-3" open={!ruleErr && !!ruleHtml}>
            <summary className="cursor-pointer font-medium">Fare Rules</summary>
            {ruleErr ? (
              <div className="mt-2 text-sm text-amber-700">
                {ruleErr}{" "}
                <button className="ml-2 rounded border px-2 py-0.5 text-xs" onClick={refetchRules} type="button">
                  Retry
                </button>
              </div>
            ) : (
              <div className="prose prose-sm mt-2" dangerouslySetInnerHTML={{ __html: ruleHtml || "<em>No rules received.</em>" }} />
            )}
          </details>

          {/* Passenger + Address form */}
          <form onSubmit={onBook} className="grid grid-cols-2 gap-3 rounded border p-3">
            <div className="col-span-2 font-medium">Passenger (Adult)</div>
            <select className="border p-2 rounded" value={form.Title} onChange={(e)=>update("Title", e.target.value)}>
              <option>Mr</option><option>Ms</option><option>Mrs</option><option>Mstr</option><option>Miss</option>
            </select>
            <select className="border p-2 rounded" value={form.Gender} onChange={(e)=>update("Gender", e.target.value)}>
              <option value="1">Male</option>
              <option value="2">Female</option>
            </select>
            <input className="border p-2 rounded" placeholder="First Name" value={form.FirstName}
                   onChange={(e)=>update("FirstName", e.target.value)} />
            <input className="border p-2 rounded" placeholder="Last Name" value={form.LastName}
                   onChange={(e)=>update("LastName", e.target.value)} />
            <label className="text-xs opacity-70 col-span-2">Date of Birth</label>
            <input className="border p-2 rounded col-span-2" type="date" value={form.DateOfBirth}
                   onChange={(e)=>update("DateOfBirth", e.target.value)} />
            <input className="border p-2 rounded col-span-2" type="email" placeholder="Email" value={form.Email}
                   onChange={(e)=>update("Email", e.target.value)} />
            <input className="border p-2 rounded col-span-2" placeholder="Mobile" value={form.Mobile}
                   onChange={(e)=>update("Mobile", e.target.value)} />

            {/* Address block */}
            <div className="col-span-2 mt-2 font-medium">Passenger Address</div>
            <input className="border p-2 rounded col-span-2" placeholder="Address Line 1 *"
                   value={form.AddressLine1} onChange={(e)=>update("AddressLine1", e.target.value)} />
            <input className="border p-2 rounded col-span-2" placeholder="Address Line 2"
                   value={form.AddressLine2} onChange={(e)=>update("AddressLine2", e.target.value)} />
            <input className="border p-2 rounded" placeholder="City"
                   value={form.City} onChange={(e)=>update("City", e.target.value)} />
            <input className="border p-2 rounded" placeholder="Country Code (e.g. IN)"
                   value={form.CountryCode} onChange={(e)=>update("CountryCode", e.target.value)} />
            <input className="border p-2 rounded col-span-2" placeholder="ZIP / Postcode"
                   value={form.ZipCode} onChange={(e)=>update("ZipCode", e.target.value)} />

            <button disabled={bookLoading} className="col-span-2 rounded bg-green-700 px-4 py-2 text-white">
              {bookLoading ? "Booking…" : "Book (create PNR)"}
            </button>
          </form>

          {/* Booking summary (after book) */}
          {(bookingId || pnr) && (
            <div className="rounded border p-3">
              <div className="font-medium mb-1">Booking</div>
              <div className="text-sm">BookingId: {bookingId ?? "-"}</div>
              <div className="text-sm">PNR: {pnr || "-"}</div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={ticketLoading}
                  onClick={() => attemptTicket()}
                  className="rounded bg-blue-600 px-3 py-1.5 text-white disabled:opacity-60"
                >
                  {ticketLoading ? "Issuing Ticket…" : ticketOk ? "Retry Ticket" : "Issue Ticket"}
                </button>

                <button
                  type="button"
                  disabled={ticketLoading}
                  onClick={() => attemptTicket("GDS")}
                  className="rounded border px-3 py-1.5 text-sm"
                  title="Force classic GDS ticketing path"
                >
                  Force GDS
                </button>

                <button
                  type="button"
                  disabled={ticketLoading}
                  onClick={() => attemptTicket("LCC")}
                  className="rounded border px-3 py-1.5 text-sm"
                  title="Force LCC ticketing path"
                >
                  Force LCC
                </button>

                <button
                  type="button"
                  disabled={detailsLoading}
                  onClick={() => refreshDetails()}
                  className="rounded border px-3 py-1.5 text-sm disabled:opacity-60"
                >
                  {detailsLoading ? "Refreshing…" : "Refresh Booking Details"}
                </button>
              </div>

              {ticketOk && (
                <div className="mt-2 rounded border border-emerald-300 bg-emerald-50 p-2 text-sm text-emerald-800">
                  Ticket issued successfully.
                </div>
              )}
              {ticketErr && (
                <div className="mt-2 rounded border border-amber-300 bg-amber-50 p-2 text-sm text-amber-800">
                  {ticketErr}
                </div>
              )}
            </div>
          )}

          {/* Diagnostics */}
          <details className="rounded border p-3">
            <summary className="cursor-pointer font-medium">Diagnostics</summary>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div>IsLCC (from quote): <strong>{String(isLccFare)}</strong></div>
              <div>Ticket path used last: <strong>{lastTicketPath ?? "-"}</strong></div>
              <div>TraceId: <span className="opacity-70">{(traceId || "").slice(0, 24)}…</span></div>
              <div>ResultIndex: <span className="opacity-70">{(resultIndex || "").toString().slice(0, 24)}…</span></div>
              <div>BookingId: <span className="opacity-70">{bookingId ?? "-"}</span></div>
              <div>PNR: <span className="opacity-70">{pnr || "-"}</span></div>
            </div>
            <div className="mt-2 text-xs text-zinc-500">
              Open DevTools → Network → <code>/api/v1/flights/tbo/ticket</code> to verify the payload being sent.
            </div>
          </details>

          {/* Full booking details (optional) */}
          {details && (
            <details className="rounded border p-3">
              <summary className="cursor-pointer font-medium">GetBookingDetails</summary>
              <pre className="mt-2 whitespace-pre-wrap text-xs">
                {JSON.stringify(details, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
