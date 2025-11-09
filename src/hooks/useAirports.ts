import { useEffect, useState } from "react";

interface Airport {
  code: string;
  city: string;
  name: string;
  country: string;
}

export default function useAirports() {
  const [airports, setAirports] = useState<Airport[]>([]);

  useEffect(() => {
    fetch("/airports.min.json")
      .then((res) => res.json())
      .then((data) => setAirports(data))
      .catch((err) => console.error("Error loading airports:", err));
  }, []);

  return airports;
}
