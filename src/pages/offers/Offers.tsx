import { useState } from "react";
import { Link } from "react-router-dom";

/**
 * PlumTrips Offers Page
 * Path: frontend/src/pages/offers/Offers.tsx
 * - Hero: Luxury intro
 * - Tabs: All, Holidays, Flights, Hotels
 * - Grid: Handpicked offers
 * - Corporate MICE explanation
 * - CTA: Concierge
 */

const OFFERS = [
  {
    id: "holiday1",
    type: "Holiday",
    title: "Romantic Maldives Escape",
    subtitle: "5 Nights • Water Villa + Seaplane Transfers",
    img: "/assets/offers/maldives.jpg",
  },
  {
    id: "holiday2",
    type: "Holiday",
    title: "Swiss Alps Experience",
    subtitle: "7 Nights • Scenic Trains & Luxury Stays",
    img: "/assets/offers/switzerland.jpg",
  },
  {
    id: "flight1",
    type: "Flight",
    title: "Return to Dubai",
    subtitle: "From Delhi • Direct Flights",
    img: "/assets/offers/dubai-flight.jpg",
  },
  {
    id: "flight2",
    type: "Flight",
    title: "Singapore Special",
    subtitle: "From Mumbai • Full-Service Airline",
    img: "/assets/offers/singapore-flight.jpg",
  },
  {
    id: "hotel1",
    type: "Hotel",
    title: "Udaipur Heritage Palace Stay",
    subtitle: "2 Nights • Lake View Suite",
    img: "/assets/offers/udaipur-hotel.jpg",
  },
  {
    id: "hotel2",
    type: "Hotel",
    title: "Dubai Marina 5★ Luxury",
    subtitle: "3 Nights • Breakfast Included",
    img: "/assets/offers/dubai-hotel.jpg",
  },
];

export default function OffersPage() {
  const [activeTab, setActiveTab] = useState<"All" | "Holiday" | "Flight" | "Hotel">("All");

  const filteredOffers =
    activeTab === "All" ? OFFERS : OFFERS.filter((o) => o.type === activeTab);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HERO */}
      <section className="relative bg-gradient-to-r from-[#00477f] to-[#0a5fa3] text-white py-20 px-6">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            Exclusive Travel Offers — Holidays, Flights & Hotels
          </h1>
          <p className="mt-4 text-lg md:text-xl opacity-90">
            Experience luxury for less. PlumTrips brings curated offers that combine
            best-in-class pricing with unmatched service — perfect for leisure travelers
            and corporates alike.
          </p>
        </div>
      </section>

      {/* TABS */}
      <div className="mx-auto max-w-7xl px-6 mt-10">
        <div className="flex justify-center gap-4 flex-wrap">
          {["All", "Holiday", "Flight", "Hotel"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                activeTab === tab
                  ? "bg-[#d06549] text-white shadow"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* OFFERS GRID */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredOffers.map((offer) => (
            <Link
              key={offer.id}
              to="/go/concierge"
              className="group rounded-2xl overflow-hidden shadow hover:shadow-lg transition ring-1 ring-slate-200 bg-white"
            >
              <div className="relative h-56 w-full">
                <img
                  src={offer.img}
                  alt={offer.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-4 text-white">
                  <div className="text-sm uppercase tracking-wide opacity-90">
                    {offer.type}
                  </div>
                  <div className="text-xl font-bold">{offer.title}</div>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-slate-600">{offer.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CORPORATE SECTION */}
      <section className="bg-white py-16 px-6">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-bold text-slate-800">
            Why PlumTrips Offers Work for Corporates
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Beyond leisure, our offers are tailored for businesses planning{" "}
            <strong>Meetings, Incentives, Conferences, and Exhibitions (MICE)</strong>.
            We simplify travel management with exclusive flight fares, hotel group
            discounts, and destination packages — helping companies save costs while
            ensuring a premium experience for employees and delegates.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-3 text-left">
            <div className="p-6 rounded-2xl shadow ring-1 ring-slate-200">
              <h3 className="text-lg font-semibold text-[#00477f]">Meetings</h3>
              <p className="mt-2 text-slate-600">
                Seamless city-to-city arrangements, boardroom-ready venues, and smooth
                transfers for executives.
              </p>
            </div>
            <div className="p-6 rounded-2xl shadow ring-1 ring-slate-200">
              <h3 className="text-lg font-semibold text-[#00477f]">Incentives</h3>
              <p className="mt-2 text-slate-600">
                Reward teams with curated holiday packages at special corporate rates,
                boosting morale and retention.
              </p>
            </div>
            <div className="p-6 rounded-2xl shadow ring-1 ring-slate-200">
              <h3 className="text-lg font-semibold text-[#00477f]">
                Conferences & Exhibitions
              </h3>
              <p className="mt-2 text-slate-600">
                From flights and hotels to large-scale event coordination, PlumTrips
                ensures everything runs flawlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-[#00477f] to-[#0a5fa3] text-white py-16 px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold">
            Ready to Unlock Your Exclusive Offer?
          </h2>
          <p className="mt-4 opacity-90">
            Whether it’s your next family vacation or a corporate event, our concierge
            team will craft the perfect itinerary at the best value.
          </p>
          <Link
            to="/go/concierge"
            className="mt-8 inline-block rounded-full bg-[#d06549] px-8 py-3 font-semibold text-white hover:opacity-95 transition"
          >
            Speak to a Concierge
          </Link>
        </div>
      </section>
    </main>
  );
}
