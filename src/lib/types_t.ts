// ============================================================
//  PLUMTRIPS — Shared Types
//  Keep in sync with TBO Global B2B API v3
// ============================================================

// ─── UI / Display Types ────────────────────────────────────

export interface Airport {
  code: string;
  city: string;
  name: string;
  country?: string;
}

export type TripType = "oneWay" | "roundTrip" | "multiCity";
export type CabinClass = "Economy" | "Premium Economy" | "Business" | "First";

export interface SearchForm {
  tripType: TripType;
  from: Airport;
  to: Airport;
  departDate: string;       // ISO date string "YYYY-MM-DD"
  returnDate: string;
  adults: number;
  children: number;
  infants: number;
  cabinClass: CabinClass;
  nonStopOnly: boolean;
  fareType: "Regular" | "Student" | "ArmedForces" | "SeniorCitizen";
}

export interface FlightSegmentDetail {
  airlineCode: string;
  airlineName: string;
  flightNumber: string;
  operatingCarrier?: string;
  fareClass?: string;
  fromCode: string;
  fromCity: string;
  fromAirport: string;
  fromTerminal?: string;
  toCode: string;
  toCity: string;
  toAirport: string;
  toTerminal?: string;
  departISO: string;
  arriveISO: string;
  departTime: string;
  arriveTime: string;
  departDate: string;
  arriveDate: string;
  duration: number;
  durationLabel: string;
  craft?: string;
  groundTime?: number;
  mile?: number;
}

export interface DisplayFlight {
  resultIndex: string;
  traceId: string;
  source: number;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  operatingCarrier?: string;
  fromCode: string;
  fromCity: string;
  fromAirport: string;
  toCode: string;
  toCity: string;
  toAirport: string;
  departTime: string;
  arriveTime: string;
  departDate: string;
  arriveDate: string;
  departISO: string;
  arriveISO: string;
  duration: number;
  durationLabel: string;
  stops: number;
  stopInfo?: string;
  price: number;
  baseFare: number;
  tax: number;
  cabinBaggage: string;
  checkinBaggage: string;
  isRefundable: boolean;
  isLCC: boolean;
  fareType: string;
  fareClass?: string;
  terminal?: string;
  arrivalTerminal?: string;
  craft?: string;
  seatsLeft?: number;
  lastTicketingDate?: string;
  isPanRequired: boolean;
  isPassportRequired: boolean;
  airlineRemark?: string;
  segments: FlightSegmentDetail[];
}

export interface FareTier {
  name: string;
  tag?: string;
  price: number;
  cabinBag: string;
  checkinBag: string;
  cancellationFee: string;
  dateChangeFee: string;
  seatSelection: string;
  meals: string;
  recommended?: boolean;
  resultIndex: string;        // each tier may have a different ResultIndex from TBO
}

export interface ActiveFilters {
  stops: number | null;        // null = all
  maxPrice: number | null;
  airlines: string[];
  departureSlot: string | null; // "morning" | "afternoon" | "evening" | "night"
  arrivalSlot: string | null;
  refundable: boolean | null;   // null = both
  sortBy: "price" | "duration" | "depart" | "arrive";
}

// ─── TBO API Types ─────────────────────────────────────────

export interface TBOAuthResponse {
  Status: { Code: number; Description: string };
  TokenId: string;
  Member: { AgencyId: string; AgentId: string; UserName: string };
}

export interface TBOSegment {
  Origin: string;
  Destination: string;
  FlightCabinClass: number;         // 1=All 2=Eco 3=PremEco 4=Biz 5=First
  PreferredDepartureTime: string;   // "2026-05-08T00:00:00"
  PreferredArrivalTime: string;
}

export interface TBOSearchRequest {
  EndUserIp: string;
  TokenId: string;
  AdultCount: number;
  ChildCount: number;
  InfantCount: number;
  DirectFlight: boolean;
  OneStopFlight: boolean;
  JourneyType: number;              // 1=OneWay 2=Return 3=MultiStop
  PreferredAirlines: null | string[];
  Segments: TBOSegment[];
  Sources: null | string[];
}

export interface TBOFare {
  Currency: string;
  BaseFare: number;
  Tax: number;
  YQTax: number;
  OtherCharges: number;
  Discount: number;
  PublishedFare: number;
  OfferedFare: number;
  ServiceFee: number;
  TotalBaggageCharges: number;
  TotalMealCharges: number;
  TotalSeatCharges: number;
  TotalSpecialServiceCharges: number;
  TaxBreakup: { key: string; value: number }[];
  AdditionalTxnFeeOfrd: number;
  AdditionalTxnFeePub: number;
  PGCharge: number;
  CommissionEarned: number;
  PLBEarned: number;
  IncentiveEarned: number;
  TdsOnCommission: number;
  TdsOnPLB: number;
  TdsOnIncentive: number;
}

export interface TBOFlightSegment {
  Airline: {
    AirlineCode: string;
    AirlineName: string;
    FlightNumber: string;
    FareClass: string;
    OperatingCarrier: string;
  };
  NoOfSeatAvailable: number;
  Origin: {
    Airport: {
      AirportCode: string;
      AirportName: string;
      Terminal: string;
      CityCode: string;
      CityName: string;
      CountryCode: string;
      CountryName: string;
    };
    DepTime: string;
  };
  Destination: {
    Airport: {
      AirportCode: string;
      AirportName: string;
      Terminal: string;
      CityCode: string;
      CityName: string;
      CountryCode: string;
      CountryName: string;
    };
    ArrTime: string;
  };
  Duration: number;
  GroundTime: number;
  Mile: number;
  StopOver: boolean;
  StopPoint: string;
  StopPointArrivalTime: string;
  StopPointDepartureTime: string;
  Craft: string;
  IsETicketEligible: boolean;
  FlightStatus: string;
  Status: string;
}

export interface TBOFlightResult {
  ResultIndex: string;
  Source: number;
  IsLCC: boolean;
  IsRefundable: boolean;
  IsPanRequiredAtBook: boolean;
  IsPanRequiredAtTicket: boolean;
  IsPassportRequiredAtBook: boolean;
  IsPassportRequiredAtTicket: boolean;
  GSTINAdvisory: string;
  AirlineRemark: string;
  IsHoldAllowed: boolean;
  LastTicketingDate: string;
  TicketAdvisory: string;
  FareType: string;
  Fare: TBOFare;
  FareBreakdown: unknown[];
  Segments: TBOFlightSegment[][];
  LastCancellationDate: string;
  Baggage: { AirlineCode: string; FlightNo: string; Baggage: string; CabinBaggage: string }[];
  CabinBaggage: { AirlineCode: string; FlightNo: string; Baggage: string; CabinBaggage: string }[];
  IsUpsellAvailable: boolean;
  Availability: number;
  FlightStatus: string;
  Status: string;
}

export interface TBOSearchResponse {
  Response: {
    ResponseStatus: number;
    Error: { ErrorCode: number; ErrorMessage: string };
    TraceId: string;
    Origin: string;
    Destination: string;
    Results: TBOFlightResult[][];
  };
}

export interface TBOFareQuoteRequest {
  EndUserIp: string;
  TokenId: string;
  TraceId: string;
  ResultIndex: string;
}

export interface TBOCancellationPolicy {
  PolicyType: number;
  Amount: number;
  FromHours: number;
  ToHours: number;
}

export interface TBOFareQuoteResponse {
  Response: {
    ResponseStatus: number;
    Error: { ErrorCode: number; ErrorMessage: string };
    TraceId: string;
    Results: TBOFlightResult;
    IsFareChanged: boolean;
    IsTimeChanged: boolean;
    IsDurationChanged: boolean;
    IsFlightChanged: boolean;
    IsRefundable: boolean;
    CancellationPolicies: TBOCancellationPolicy[];
    DateChange: unknown[];
  };
}

export interface TBOBookPassenger {
  Title: string;             // "Mr" | "Mrs" | "Ms" | "Mstr" | "Miss"
  FirstName: string;
  LastName: string;
  PaxType: number;           // 1=Adult 2=Child 3=Infant
  DateOfBirth: string;       // "YYYY-MM-DDTHH:MM:SS"
  Gender: number;            // 1=Male 2=Female
  PassportNo?: string;
  PassportExpiry?: string;
  Nationality: string;       // "IN"
  AddressLine1: string;
  City: string;
  CountryCode: string;
  CountryName: string;
  ContactNo: string;
  Email: string;
  IsLeadPax: boolean;
  FFAirlineCode?: string;
  FFNumber?: string;
  GSTCompanyAddress?: string;
  GSTCompanyContactNumber?: string;
  GSTCompanyName?: string;
  GSTNumber?: string;
  GSTCompanyEmail?: string;
}

export interface TBOBookRequest {
  EndUserIp: string;
  TokenId: string;
  TraceId: string;
  ResultIndex: string;
  Passengers: TBOBookPassenger[];
}

export interface TBOBookResponse {
  Response: {
    ResponseStatus: number;
    Error: { ErrorCode: number; ErrorMessage: string };
    TraceId: string;
    PNR: string;
    BookingId: number;
    SSRDenied: boolean;
    SSRMessage: string;
    Status: number;
    IsPriceChanged: boolean;
    IsTimeChanged: boolean;
    FlightItinerary: {
      BookingId: number;
      PNR: string;
      IsDomestic: boolean;
      Passenger: TBOBookPassenger[];
      Fare: TBOFare;
      Segments: TBOFlightSegment[][];
    };
  };
}