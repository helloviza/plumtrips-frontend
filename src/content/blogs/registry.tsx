// src/content/blogs/registry.tsx

// ----- Covers for the first 5 (custom filenames) -----
const cover_affordable = new URL(
  "./10-affordable-trips-you-can-book-through-plumtrips/cover-affordable-trips.jpg",
  import.meta.url
).href;

const cover_culinary = new URL(
  "./10-culinary-delights-from-around-the-world-a-journey-for-your-taste-buds/cover-culinary.jpg",
  import.meta.url
).href;

const cover_luxury = new URL(
  "./10-luxurious-vacation-destinations-you-can-find-on-plumtrips/cover-luxury.jpg",
  import.meta.url
).href;

const cover_germany_paradise = new URL(
  "./10-short-flights-from-germany-to-paradise-book-with-plumtrips/cover-germany-paradise.jpg",
  import.meta.url
).href;

const cover_crystal = new URL(
  "./crystal-clear-waters-dream-destinations-around-the-world-not-just-in-the-maldives/cover-crystal-clear.jpg",
  import.meta.url
).href;

// ----- Covers for the remaining pages (match each page's cover filename) -----
const cover_flamingos = new URL(
  "./flamingos-up-close-in-paradise-unforgettable-travel-experiences/cover-flamingos.jpg",
  import.meta.url
).href;

const cover_kos = new URL(
  "./hidden-gem-kos-greece-a-short-flight-to-pure-relaxation-with-swim-up-pools/cover-kos.jpg",
  import.meta.url
).href;

const cover_hiddenresorts = new URL(
  "./hidden-gems-resorts-surrounded-by-breathtaking-nature-cuisine-and-relaxation/cover-hidden-gems.jpg",
  import.meta.url
).href;

const cover_undiscovered = new URL(
  "./magical-holiday-destinations-that-are-still-undiscovered-hidden-gems-with-plumtrips/cover-undiscovered.jpg",
  import.meta.url
).href;

const cover_wellness_de = new URL(
  "./pure-relaxation-the-best-wellness-destinations-in-germany-for-a-relaxing-weekend/cover-germany-wellness.jpg",
  import.meta.url
).href;

const cover_bahamas_pigs = new URL(
  "./swimming-in-paradise-swimming-with-pigs-in-the-crystal-clear-waters-of-the-bahamas/cover-bahamas-pigs.jpg",
  import.meta.url
).href;

const cover_animal_friendly = new URL(
  "./the-best-animal-friendly-trips-breathtaking-nature-and-unforgettable-activities/cover-animal-friendly.jpg",
  import.meta.url
).href;

const cover_safaris = new URL(
  "./the-best-safaris-to-remember-for-a-lifetime/cover-safari.jpg",
  import.meta.url
).href;

const cover_maldives_best = new URL(
  "./the-most-beautiful-beaches-and-resorts-in-the-maldives-your-paradise-vacation/cover-maldives-beaches.jpg",
  import.meta.url
).href;

const cover_world_beaches = new URL(
  "./the-most-beautiful-beaches-in-the-world-your-dream-vacation-with-plumtrips/cover-world-beaches.jpg",
  import.meta.url
).href;

const cover_europe_places = new URL(
  "./the-most-beautiful-places-in-europe-discover-the-best-travel-destinations-on-plumtrips/cover-europe-places.jpg",
  import.meta.url
).href;

const cover_exotic = new URL(
  "./the-most-exotic-countries-in-the-world-an-adventure-beyond-the-familiar/cover-exotic.jpg",
  import.meta.url
).href;

const cover_autumn = new URL(
  "./top-10-vacation-spots-for-autumn-holidays-discover-the-best-destinations-on-plumtrips/cover-autumn.jpg",
  import.meta.url
).href;

const cover_dubai = new URL(
  "./travel-to-dubai-top-10-hotels-and-activities/cover-dubai.jpg",
  import.meta.url
).href;

const cover_bali = new URL(
  "./traveling-to-bali-top-10-hotels-and-activities/cover-bali.jpg",
  import.meta.url
).href;

const cover_nature_food = new URL(
  "./vacation-in-nature-experience-wildlife-and-culinary-delights/cover-nature-food.jpg",
  import.meta.url
).href;

const cover_winter_de = new URL(
  "./winterurlaubsorte-kalte-oder-warme-finde-dein-perfektes-reiseziel-uber-plumtrips/cover-winter-de.jpg",
  import.meta.url
).href;

export const BLOGS = [
  {
    slug: "10-affordable-trips-you-can-book-through-plumtrips",
    title: "10 Affordable Trips You Can Book Through PlumTrips",
    excerpt:
      "From boutique hostels in Budapest to sunset escapes in Lisbon, here’s your Gen Z-friendly guide to 10 pocket-smart adventures without compromising luxury.",
    tags: ["Gen Z", "Luxury Travel", "Budget Chic"],
    cover: cover_affordable,
  },
  {
    slug: "10-culinary-delights-from-around-the-world-a-journey-for-your-taste-buds",
    title:
      "10 Culinary Delights From Around The World — A Journey For Your Taste Buds",
    excerpt:
      "From Tokyo ramen counters to Barcelona tapas bars — the world’s tastiest cities, served the Plum way.",
    tags: ["Food Trips", "City Breaks", "Gen Z"],
    cover: cover_culinary,
  },
  {
    slug: "10-luxurious-vacation-destinations-you-can-find-on-plumtrips",
    title: "10 Luxurious Vacation Destinations You Can Find On PlumTrips",
    excerpt:
      "Overwater dawns, cliff-edge sunsets, private pools & whisper-quiet service — here’s the PlumTrips shortlist for your next flex.",
    tags: ["Luxury", "Honeymoon", "Bucket List"],
    cover: cover_luxury,
  },
  {
    slug: "10-short-flights-from-germany-to-paradise-book-with-plumtrips",
    title:
      "10 Short Flights From Germany To Paradise — Book With PlumTrips",
    excerpt:
      "Weekend escapes, sunny coasts, island bliss — 10 destinations under 4 hours from Germany, curated the PlumTrips way.",
    tags: ["Weekend Getaways", "Island Vibes", "Europe"],
    cover: cover_germany_paradise,
  },
  {
    slug: "crystal-clear-waters-dream-destinations-around-the-world-not-just-in-the-maldives",
    title:
      "Crystal Clear Waters: Dream Destinations Around The World — Not Just In The Maldives",
    excerpt:
      "From Bora Bora to Palawan, here’s your handpicked edit of the clearest waters on earth — curated by PlumTrips.",
    tags: ["Beach Vibes", "Luxury Escapes", "Bucket List"],
    cover: cover_crystal,
  },

  // ----- Remaining 17 -----
  {
    slug: "flamingos-up-close-in-paradise-unforgettable-travel-experiences",
    title:
      "Flamingos Up Close In Paradise — Unforgettable Travel Experiences",
    excerpt:
      "Candy-pink lagoons and mirror-like shallows — the chic way to meet flamingos up close.",
    tags: ["Wildlife", "Photography", "Island Vibes"],
    cover: cover_flamingos,
  },
  {
    slug: "hidden-gem-kos-greece-a-short-flight-to-pure-relaxation-with-swim-up-pools",
    title:
      "Hidden Gem Kos, Greece — A Short Flight To Pure Relaxation (With Swim-Up Pools)",
    excerpt:
      "Kos keeps it quiet: white lanes, turquoise coves, and swim-up suites that whisper luxury.",
    tags: ["Greece", "Short Flights", "Pool Suites"],
    cover: cover_kos,
  },
  {
    slug: "hidden-gems-resorts-surrounded-by-breathtaking-nature-cuisine-and-relaxation",
    title:
      "Hidden Gems — Resorts Surrounded By Breathtaking Nature, Cuisine & Relaxation",
    excerpt:
      "Forest villas, cliffside spas, and farm-to-fork dinners — true hidden-gem energy.",
    tags: ["Hidden Gems", "Nature", "Wellness"],
    cover: cover_hiddenresorts,
  },
  {
    slug: "magical-holiday-destinations-that-are-still-undiscovered-hidden-gems-with-plumtrips",
    title:
      "Magical Holiday Destinations That Are Still Undiscovered — Hidden Gems With PlumTrips",
    excerpt:
      "Under-the-radar shores and heritage towns — go now, before everyone else.",
    tags: ["Undiscovered", "Islands", "Culture"],
    cover: cover_undiscovered,
  },
  {
    slug: "pure-relaxation-the-best-wellness-destinations-in-germany-for-a-relaxing-weekend",
    title:
      "Pure Relaxation — The Best Wellness Destinations In Germany For A Relaxing Weekend",
    excerpt:
      "Thermal baths, forest saunas, and design hotels — reset mode: ON.",
    tags: ["Germany", "Wellness", "Weekend"],
    cover: cover_wellness_de,
  },
  {
    slug: "swimming-in-paradise-swimming-with-pigs-in-the-crystal-clear-waters-of-the-bahamas",
    title:
      "Swimming In Paradise — Swimming With Pigs In The Crystal Clear Waters Of The Bahamas",
    excerpt:
      "Emerald shallows, friendly pigs, and a boat day you’ll never forget.",
    tags: ["Bahamas", "Unique", "Boat Day"],
    cover: cover_bahamas_pigs,
  },
  {
    slug: "the-best-animal-friendly-trips-breathtaking-nature-and-unforgettable-activities",
    title:
      "The Best Animal-Friendly Trips — Breathtaking Nature & Unforgettable Activities",
    excerpt:
      "Ethical wildlife encounters with expert guides and low-impact stays.",
    tags: ["Wildlife", "Ethical", "Outdoors"],
    cover: cover_animal_friendly,
  },
  {
    slug: "the-best-safaris-to-remember-for-a-lifetime",
    title: "The Best Safaris — To Remember For A Lifetime",
    excerpt:
      "Dawn drives, sundowners, and stargazer lodges — lifetime safari ideas.",
    tags: ["Safari", "Africa", "Bucket List"],
    cover: cover_safaris,
  },
  {
    slug: "the-most-beautiful-beaches-and-resorts-in-the-maldives-your-paradise-vacation",
    title:
      "The Most Beautiful Beaches & Resorts In The Maldives — Your Paradise Vacation",
    excerpt:
      "Iconic blues, powder sands, and overwater villas — Maldives perfected.",
    tags: ["Maldives", "Overwater", "Honeymoon"],
    cover: cover_maldives_best,
  },
  {
    slug: "the-most-beautiful-beaches-in-the-world-your-dream-vacation-with-plumtrips",
    title:
      "The Most Beautiful Beaches In The World — Your Dream Vacation With PlumTrips",
    excerpt:
      "From Caribbean shallows to Greek coves — the world’s prettiest sands, curated.",
    tags: ["Beaches", "Bucket List", "Islands"],
    cover: cover_world_beaches,
  },
  {
    slug: "the-most-beautiful-places-in-europe-discover-the-best-travel-destinations-on-plumtrips",
    title:
      "The Most Beautiful Places In Europe — Discover The Best Travel Destinations On PlumTrips",
    excerpt:
      "Clifftop villages, alpine mirrors, storybook streets — Europe’s best, distilled.",
    tags: ["Europe", "City+Nature", "Inspo"],
    cover: cover_europe_places,
  },
  {
    slug: "the-most-exotic-countries-in-the-world-an-adventure-beyond-the-familiar",
    title:
      "The Most Exotic Countries In The World — An Adventure Beyond The Familiar",
    excerpt:
      "Vivid markets, jungle hideaways, and coastlines you’ve only seen in dreams.",
    tags: ["Exotic", "Culture", "Adventure"],
    cover: cover_exotic,
  },
  {
    slug: "top-10-vacation-spots-for-autumn-holidays-discover-the-best-destinations-on-plumtrips",
    title:
      "Top 10 Vacation Spots For Autumn Holidays — Discover The Best Destinations On PlumTrips",
    excerpt:
      "Fall color, warm seas, truffle nights — the sweet spot of the year.",
    tags: ["Autumn", "Seasonal", "Short Breaks"],
    cover: cover_autumn,
  },
  {
    slug: "travel-to-dubai-top-10-hotels-and-activities",
    title: "Travel To Dubai — Top 10 Hotels & Activities",
    excerpt:
      "Skyline suites, desert silence, and yacht afternoons — Dubai, done right.",
    tags: ["Dubai", "City Luxe", "Desert"],
    cover: cover_dubai,
  },
  {
    slug: "traveling-to-bali-top-10-hotels-and-activities",
    title: "Traveling To Bali — Top 10 Hotels & Activities",
    excerpt:
      "Jungle pools, temple dawns, surf sunsets — Bali is a mood you can live in.",
    tags: ["Bali", "Wellness", "Nature"],
    cover: cover_bali,
  },
  {
    slug: "vacation-in-nature-experience-wildlife-and-culinary-delights",
    title:
      "Vacation In Nature — Experience Wildlife & Culinary Delights",
    excerpt:
      "Forest lodges, chef gardens, and quiet trails — nature’s luxury edit.",
    tags: ["Nature", "Food", "Slow Travel"],
    cover: cover_nature_food,
  },
  {
    slug: "winterurlaubsorte-kalte-oder-warme-finde-dein-perfektes-reiseziel-uber-plumtrips",
    title:
      "Winterurlaubsorte — Kalte Oder Warme? Finde Dein Perfektes Reiseziel Über PlumTrips",
    excerpt:
      "Sonne oder Schnee? Von Alpenzauber bis Inselwärme — dein perfekter Wintertrip.",
    tags: ["Winter", "SonneOderSchnee", "DE"],
    cover: cover_winter_de,
  },
];
