import React, { useEffect, useRef, useState } from 'react';
import type { LeafletMouseEvent, Map as LeafletMap, Marker as LeafletMarker } from 'leaflet';
import type { BlogLocation } from './blogs.model';

const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629];
const SEARCH_DEBOUNCE_MS = 350;

interface GeocodeResult {
  display_name: string;
  lat: string;
  lon: string;
}

const searchLocations = async (query: string, signal: AbortSignal): Promise<GeocodeResult[]> => {
  const params = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    limit: '5',
    addressdetails: '1',
  });
  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    signal,
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`Location search failed (${response.status})`);
  return (await response.json()) as GeocodeResult[];
};

const isValidLatitude = (value: number): boolean => Number.isFinite(value) && value >= -90 && value <= 90;
const isValidLongitude = (value: number): boolean => Number.isFinite(value) && value >= -180 && value <= 180;

const isCompleteLocation = (
  name: string,
  latitude: number | null,
  longitude: number | null,
): latitude is number =>
  Boolean(name.trim()) &&
  latitude !== null &&
  longitude !== null &&
  isValidLatitude(latitude) &&
  isValidLongitude(longitude);

const BlogLocationPicker: React.FC<{
  value?: BlogLocation;
  onChange: (location?: BlogLocation) => void;
}> = ({ value, onChange }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const placeMarkerRef = useRef<((nextLatitude: number, nextLongitude: number, zoom?: number) => void) | null>(null);
  const onChangeRef = useRef(onChange);
  const nameRef = useRef(value?.name || '');
  const skipNextValueSyncRef = useRef(false);
  const [name, setName] = useState(value?.name || '');
  const [latitude, setLatitude] = useState<number | null>(value?.latitude ?? null);
  const [longitude, setLongitude] = useState<number | null>(value?.longitude ?? null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(value?.name || '');
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [editingCoordinates, setEditingCoordinates] = useState(false);
  const [draftLatitude, setDraftLatitude] = useState('');
  const [draftLongitude, setDraftLongitude] = useState('');
  const [coordinateError, setCoordinateError] = useState<string | null>(null);
  const searchRequestRef = useRef<AbortController | null>(null);
  const searchSequenceRef = useRef(0);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (skipNextValueSyncRef.current) {
      skipNextValueSyncRef.current = false;
      return;
    }
    setName(value?.name || '');
    setSearchQuery(value?.name || '');
    nameRef.current = value?.name || '';
    setLatitude(value?.latitude ?? null);
    setLongitude(value?.longitude ?? null);
  }, [value]);

  const updateLocation = (nextLatitude: number, nextLongitude: number) => {
    setLatitude(nextLatitude);
    setLongitude(nextLongitude);
    if (isCompleteLocation(nameRef.current, nextLatitude, nextLongitude)) {
      onChangeRef.current({
        name: nameRef.current.trim(),
        latitude: nextLatitude,
        longitude: nextLongitude,
      });
    }
  };

  useEffect(() => {
    const query = searchQuery.trim();
    setSuggestions([]);
    setSearchError(null);
    if (query.length < 3) {
      searchRequestRef.current?.abort();
      setSearching(false);
      return;
    }

    const sequence = ++searchSequenceRef.current;
    const controller = new AbortController();
    searchRequestRef.current?.abort();
    searchRequestRef.current = controller;
    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchLocations(query, controller.signal);
        if (sequence !== searchSequenceRef.current) return;
        setSuggestions(results);
        if (!results.length) setSearchError('No matching locations found.');
      } catch (error) {
        if (controller.signal.aborted || sequence !== searchSequenceRef.current) return;
        setSearchError(error instanceof Error ? error.message : 'Location search failed.');
      } finally {
        if (!controller.signal.aborted && sequence === searchSequenceRef.current) setSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    let disposed = false;
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(stylesheet);

    import('leaflet')
      .then(({ default: L }) => {
        if (disposed || !mapContainerRef.current || mapRef.current) return;

        const initialPosition: [number, number] =
          value && isValidLatitude(value.latitude) && isValidLongitude(value.longitude)
            ? [value.latitude, value.longitude]
            : DEFAULT_CENTER;
        const map = L.map(mapContainerRef.current, {
          center: initialPosition,
          zoom: value ? 13 : 5,
          zoomControl: true,
        });
        mapRef.current = map;
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        const setMarker = (nextLatitude: number, nextLongitude: number) => {
          if (!isValidLatitude(nextLatitude) || !isValidLongitude(nextLongitude)) return;
          if (!markerRef.current) {
            markerRef.current = L.marker([nextLatitude, nextLongitude], {
              draggable: true,
              icon: L.divIcon({
                className: 'blog-location-marker',
                html: '<span aria-hidden="true" style="display:block;width:18px;height:18px;border-radius:50%;background:#a17f3b;border:3px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,.35);"></span>',
                iconSize: [18, 18],
                iconAnchor: [9, 9],
              }),
            }).addTo(map);
            markerRef.current.on('dragend', () => {
              const position = markerRef.current?.getLatLng();
              if (position) updateLocation(position.lat, position.lng);
            });
          } else {
            markerRef.current.setLatLng([nextLatitude, nextLongitude]);
          }
          map.panTo([nextLatitude, nextLongitude]);
        };
        placeMarkerRef.current = (nextLatitude, nextLongitude, zoom = 13) => {
          setMarker(nextLatitude, nextLongitude);
          map.setView([nextLatitude, nextLongitude], zoom);
        };

        if (value && isValidLatitude(value.latitude) && isValidLongitude(value.longitude)) {
          setMarker(value.latitude, value.longitude);
        }

        map.on('click', (event: LeafletMouseEvent) => {
          setMarker(event.latlng.lat, event.latlng.lng);
          updateLocation(event.latlng.lat, event.latlng.lng);
        });
      })
      .catch(() => {
        if (!disposed) setMapError('The map could not be loaded. Please try again.');
      });

    return () => {
      disposed = true;
      markerRef.current?.remove();
      markerRef.current = null;
      placeMarkerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      stylesheet.remove();
    };
    // The map is intentionally initialized once for this editor control.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker || latitude === null || longitude === null) return;
    if (isValidLatitude(latitude) && isValidLongitude(longitude)) {
      marker.setLatLng([latitude, longitude]);
    }
  }, [latitude, longitude]);

  const handleNameChange = (nextName: string) => {
    setName(nextName);
    setSearchQuery(nextName);
    nameRef.current = nextName;
    if (isCompleteLocation(nextName, latitude, longitude)) {
      onChange({
        name: nextName.trim(),
        latitude,
        longitude,
      });
    } else if (latitude !== null && longitude !== null) {
      skipNextValueSyncRef.current = true;
      onChange(undefined);
    }
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && suggestions[0]) {
      event.preventDefault();
      selectSuggestion(suggestions[0]);
    }
    if (event.key === 'Escape') setSuggestions([]);
  };

  const selectSuggestion = (result: GeocodeResult) => {
    const nextLatitude = Number(result.lat);
    const nextLongitude = Number(result.lon);
    if (!isValidLatitude(nextLatitude) || !isValidLongitude(nextLongitude)) {
      setSearchError('The selected result has invalid coordinates.');
      return;
    }
    const nextName = result.display_name.trim();
    setName(nextName);
    setSearchQuery(nextName);
    nameRef.current = nextName;
    setLatitude(nextLatitude);
    setLongitude(nextLongitude);
    setSuggestions([]);
    setSearchError(null);
    placeMarkerRef.current?.(nextLatitude, nextLongitude);
    onChange({ name: nextName, latitude: nextLatitude, longitude: nextLongitude });
  };

  const beginCoordinateEdit = () => {
    if (latitude === null || longitude === null) return;
    setDraftLatitude(String(latitude));
    setDraftLongitude(String(longitude));
    setCoordinateError(null);
    setEditingCoordinates(true);
  };

  const saveManualCoordinates = () => {
    const nextLatitude = Number(draftLatitude.trim());
    const nextLongitude = Number(draftLongitude.trim());
    const latitudeValid = draftLatitude.trim() !== '' && isValidLatitude(nextLatitude);
    const longitudeValid = draftLongitude.trim() !== '' && isValidLongitude(nextLongitude);

    if (!latitudeValid || !longitudeValid) {
      setCoordinateError('Enter a finite latitude (-90 to 90) and longitude (-180 to 180).');
      return;
    }

    setLatitude(nextLatitude);
    setLongitude(nextLongitude);
    setCoordinateError(null);
    setEditingCoordinates(false);
    placeMarkerRef.current?.(nextLatitude, nextLongitude);
    if (name.trim()) {
      onChange({
        name: name.trim(),
        latitude: nextLatitude,
        longitude: nextLongitude,
      });
    }
  };

  const cancelCoordinateEdit = () => {
    setDraftLatitude(latitude === null ? '' : String(latitude));
    setDraftLongitude(longitude === null ? '' : String(longitude));
    setCoordinateError(null);
    setEditingCoordinates(false);
  };

  const clearLocation = () => {
    setName('');
    setSearchQuery('');
    nameRef.current = '';
    setLatitude(null);
    setLongitude(null);
    skipNextValueSyncRef.current = true;
    markerRef.current?.remove();
    markerRef.current = null;
    onChange(undefined);
  };

  const incomplete = Boolean(name.trim()) !== Boolean(latitude !== null && longitude !== null);

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div>
        <label htmlFor="blog-location-name" style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>
          Location name
        </label>
        <input
          id="blog-location-name"
          style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
          value={name}
          onChange={(event) => handleNameChange(event.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder="e.g. Marina Beach"
          aria-describedby="blog-location-help blog-location-status"
        />
        {(searching || suggestions.length > 0 || searchError) && (
          <div style={{ position: 'relative' }}>
            <div
              style={{ position: 'absolute', zIndex: 1000, left: 0, right: 0, top: 4, background: '#fff', border: '1px solid #ddd', borderRadius: 8, boxShadow: '0 8px 20px rgba(0,0,0,.1)', overflow: 'hidden' }}
              role="listbox"
              aria-label="Location search results"
            >
              {searching && <div style={{ padding: 10, fontSize: 12, color: '#777' }}>Searching locations…</div>}
              {!searching && suggestions.map((result) => (
                <button
                  key={`${result.lat}-${result.lon}-${result.display_name}`}
                  type="button"
                  role="option"
                  onClick={() => selectSuggestion(result)}
                  style={{ display: 'block', width: '100%', padding: '10px 12px', textAlign: 'left', border: 0, borderBottom: '1px solid #eee', background: '#fff', cursor: 'pointer', fontSize: 12 }}
                >
                  {result.display_name}
                </button>
              ))}
              {!searching && searchError && suggestions.length === 0 && <div style={{ padding: 10, fontSize: 12, color: '#b42318' }}>{searchError}</div>}
            </div>
          </div>
        )}
      </div>

      <div
        ref={mapContainerRef}
        style={{ width: '100%', height: 300, borderRadius: 10, overflow: 'hidden', background: '#f0f0f0' }}
        aria-label="Select the blog location on the map"
      />

      <p id="blog-location-help" style={{ margin: 0, color: '#777', fontSize: 12 }}>
        Click the map to place the marker, then drag it to fine-tune the position.
      </p>
      <p style={{ margin: 0, color: '#999', fontSize: 11 }}>
        Search data © OpenStreetMap contributors.
      </p>

      {mapError && <p style={{ margin: 0, color: '#b42318', fontSize: 12 }} role="alert">{mapError}</p>}
      {incomplete && (
        <p id="blog-location-status" style={{ margin: 0, color: '#9a6700', fontSize: 12 }} role="status">
          Enter a location name and select a point on the map before saving.
        </p>
      )}

      {latitude !== null && longitude !== null && !editingCoordinates && (
        <div style={{ display: 'grid', gap: 8 }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', padding: '10px 12px', borderRadius: 8, background: '#fafafa', border: '1px solid #eee', fontSize: 12 }}>
            <span><strong>Latitude:</strong> {latitude.toFixed(5)}</span>
            <span><strong>Longitude:</strong> {longitude.toFixed(5)}</span>
          </div>
          <button type="button" className="btn btn-sm" onClick={beginCoordinateEdit} aria-label="Edit location coordinates" title="Edit location coordinates" style={{ justifySelf: 'start' }}>
            ✏️ Edit coordinates
          </button>
        </div>
      )}

      {editingCoordinates && (
        <div style={{ display: 'grid', gap: 10, padding: 12, borderRadius: 8, background: '#fafafa', border: '1px solid #eee' }}>
          <label style={{ display: 'grid', gap: 4, fontSize: 12, fontWeight: 600, color: '#555' }}>
            Latitude
            <input
              type="text"
              inputMode="decimal"
              value={draftLatitude}
              onChange={(event) => setDraftLatitude(event.target.value)}
              aria-invalid={Boolean(coordinateError)}
              style={{ padding: 8, borderRadius: 7, border: '1px solid #ddd', fontWeight: 400 }}
            />
          </label>
          <label style={{ display: 'grid', gap: 4, fontSize: 12, fontWeight: 600, color: '#555' }}>
            Longitude
            <input
              type="text"
              inputMode="decimal"
              value={draftLongitude}
              onChange={(event) => setDraftLongitude(event.target.value)}
              aria-invalid={Boolean(coordinateError)}
              style={{ padding: 8, borderRadius: 7, border: '1px solid #ddd', fontWeight: 400 }}
            />
          </label>
          {coordinateError && <p style={{ margin: 0, color: '#b42318', fontSize: 12 }} role="alert">{coordinateError}</p>}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-sm btn-primary" onClick={saveManualCoordinates}>Save</button>
            <button type="button" className="btn btn-sm" onClick={cancelCoordinateEdit}>Cancel</button>
          </div>
        </div>
      )}

      {(name || latitude !== null || longitude !== null) && (
        <button type="button" className="btn btn-sm" onClick={clearLocation} style={{ justifySelf: 'start' }}>
          Clear location
        </button>
      )}
    </div>
  );
};

export default BlogLocationPicker;