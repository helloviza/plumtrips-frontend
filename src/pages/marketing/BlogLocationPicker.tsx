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

const isValidCoordinates = (
  lat: number | null,
  lon: number | null,
): lat is number =>
  lat !== null && lon !== null && isValidLatitude(lat) && isValidLongitude(lon);

const isCompleteLocation = (
  name: string,
  latitude: number | null,
  longitude: number | null,
): latitude is number =>
  Boolean(name.trim()) && isValidCoordinates(latitude, longitude);

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
    setDraftLatitude(String(nextLatitude));
    setDraftLongitude(String(nextLongitude));
    setCoordinateError(null);
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
    if (latitude === null || longitude === null) {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      return;
    }
    if (isValidLatitude(latitude) && isValidLongitude(longitude)) {
      if (markerRef.current) {
        markerRef.current.setLatLng([latitude, longitude]);
      } else if (placeMarkerRef.current) {
        placeMarkerRef.current(latitude, longitude);
      }
    }
  }, [latitude, longitude]);

  const handleNameChange = (nextName: string) => {
    setName(nextName);
    setSearchQuery(nextName);
    nameRef.current = nextName;
    if (nextName.trim() && latitude !== null && longitude !== null && isValidLatitude(latitude) && isValidLongitude(longitude)) {
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
    setDraftLatitude(latitude === null ? '' : String(latitude));
    setDraftLongitude(longitude === null ? '' : String(longitude));
    setCoordinateError(null);
    setEditingCoordinates(true);
  };

  const saveManualCoordinates = () => {
    const latStr = draftLatitude.trim();
    const lonStr = draftLongitude.trim();

    if (!latStr || !lonStr) {
      setCoordinateError('Please enter both latitude and longitude.');
      return;
    }

    const nextLatitude = Number(latStr);
    const nextLongitude = Number(lonStr);

    if (isNaN(nextLatitude) || !Number.isFinite(nextLatitude) || nextLatitude < -90 || nextLatitude > 90) {
      setCoordinateError('Latitude must be a valid number between -90 and 90.');
      return;
    }

    if (isNaN(nextLongitude) || !Number.isFinite(nextLongitude) || nextLongitude < -180 || nextLongitude > 180) {
      setCoordinateError('Longitude must be a valid number between -180 and 180.');
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
    setDraftLatitude('');
    setDraftLongitude('');
    setEditingCoordinates(false);
    setCoordinateError(null);
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

      {!editingCoordinates ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            padding: '10px 14px',
            borderRadius: 8,
            background: '#fafafa',
            border: '1px solid #eee',
            fontSize: 12,
          }}
        >
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <span>
              <strong>Latitude:</strong> {latitude !== null ? latitude.toFixed(5) : 'Not set'}
            </span>
            <span>
              <strong>Longitude:</strong> {longitude !== null ? longitude.toFixed(5) : 'Not set'}
            </span>
          </div>
          <button
            type="button"
            className="btn btn-sm"
            onClick={beginCoordinateEdit}
            aria-label="Edit coordinates manually"
            title="Edit coordinates manually"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 12px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid #ddd',
              borderRadius: 6,
              background: '#fff',
            }}
          >
            ✏️ Edit coordinates
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gap: 12,
            padding: 14,
            borderRadius: 8,
            background: '#fafafa',
            border: '1px solid #e0e0e0',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#333' }}>Edit coordinates manually</span>
            <span style={{ fontSize: 11, color: '#777' }}>Latitude: -90 to 90 | Longitude: -180 to 180</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <label style={{ display: 'grid', gap: 4, fontSize: 12, fontWeight: 600, color: '#555' }}>
              Latitude
              <input
                type="text"
                inputMode="decimal"
                value={draftLatitude}
                onChange={(event) => {
                  setDraftLatitude(event.target.value);
                  setCoordinateError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveManualCoordinates();
                  if (e.key === 'Escape') cancelCoordinateEdit();
                }}
                placeholder="e.g. 13.08270 (-90 to 90)"
                aria-invalid={Boolean(coordinateError)}
                style={{
                  padding: '8px 10px',
                  borderRadius: 6,
                  border: coordinateError ? '1px solid #d92d20' : '1px solid #ddd',
                  fontSize: 13,
                  fontWeight: 400,
                  outline: 'none',
                }}
              />
            </label>
            <label style={{ display: 'grid', gap: 4, fontSize: 12, fontWeight: 600, color: '#555' }}>
              Longitude
              <input
                type="text"
                inputMode="decimal"
                value={draftLongitude}
                onChange={(event) => {
                  setDraftLongitude(event.target.value);
                  setCoordinateError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveManualCoordinates();
                  if (e.key === 'Escape') cancelCoordinateEdit();
                }}
                placeholder="e.g. 80.27070 (-180 to 180)"
                aria-invalid={Boolean(coordinateError)}
                style={{
                  padding: '8px 10px',
                  borderRadius: 6,
                  border: coordinateError ? '1px solid #d92d20' : '1px solid #ddd',
                  fontSize: 13,
                  fontWeight: 400,
                  outline: 'none',
                }}
              />
            </label>
          </div>
          {coordinateError && (
            <p style={{ margin: 0, color: '#b42318', fontSize: 12, fontWeight: 500 }} role="alert">
              ⚠️ {coordinateError}
            </p>
          )}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={saveManualCoordinates}
              style={{
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                borderRadius: 6,
                background: '#1a1a1a',
                color: '#fff',
                border: 'none',
              }}
            >
              Save coordinates
            </button>
            <button
              type="button"
              className="btn btn-sm"
              onClick={cancelCoordinateEdit}
              style={{
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                borderRadius: 6,
                background: '#fff',
                color: '#444',
                border: '1px solid #ddd',
              }}
            >
              Cancel
            </button>
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