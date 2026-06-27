"use client";

import { useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Input } from "@/components/ui/input";

// Fix default marker icon
const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

const DEFAULT_POSITION: [number, number] = [-1.243445526438631, 110.53195397300267]; // Sandai, Ketapang

function LocationMarker({
  position,
  onMove,
}: {
  position: [number, number] | null;
  onMove: (lat: number, lng: number) => void;
}) {
  const markerRef = useRef<L.Marker | null>(null);

  useMapEvents({
    click(e) {
      onMove(e.latlng.lat, e.latlng.lng);
    },
  });

  if (!position) return null;

  return (
    <Marker
      position={position}
      draggable
      ref={markerRef}
      eventHandlers={{
        dragend: () => {
          const marker = markerRef.current;
          if (marker) {
            const latlng = marker.getLatLng();
            onMove(latlng.lat, latlng.lng);
          }
        },
      }}
    />
  );
}

function MapController({ onSearchResult }: { onSearchResult: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSearchResult(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface SearchBoxProps {
  onSelect: (lat: number, lng: number, name: string) => void;
}

function SearchBox({ onSelect }: SearchBoxProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ lat: string; lon: string; display_name: string }[]>([]);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  function handleInput(value: string) {
    setQuery(value);
    if (timer.current) clearTimeout(timer.current);

    if (value.length < 3) {
      setResults([]);
      setOpen(false);
      return;
    }

    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(value)}`,
          { headers: { "Accept-Language": "id" } },
        );
        const data = await res.json();
        setResults(data);
        setOpen(data.length > 0);
      } catch {
        setResults([]);
      }
    }, 400);
  }

  function pick(r: { lat: string; lon: string; display_name: string }) {
    setQuery(r.display_name);
    setOpen(false);
    onSelect(Number(r.lat), Number(r.lon), r.display_name);
  }

  return (
    <div className="relative z-[1000]">
      <Input
        value={query}
        onChange={(e) => handleInput(e.target.value)}
        placeholder="Cari lokasi..."
        className="bg-white shadow-sm"
      />
      {open && (
        <ul className="absolute left-0 right-0 top-full mt-1 max-h-48 overflow-y-auto rounded-md border bg-white shadow-lg">
          {results.map((r, i) => (
            <li
              key={i}
              onClick={() => pick(r)}
              className="cursor-pointer px-3 py-2 text-sm hover:bg-muted"
            >
              {r.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface MapPickerProps {
  latitude: string;
  longitude: string;
  onLocationChange: (lat: string, lng: string, address?: string) => void;
}

export default function MapPicker({ latitude, longitude, onLocationChange }: MapPickerProps) {
  const pos: [number, number] | null =
    latitude && longitude && !isNaN(Number(latitude)) && !isNaN(Number(longitude))
      ? [Number(latitude), Number(longitude)]
      : null;
  const displayPosition = pos ?? DEFAULT_POSITION;

  const handleMove = useCallback(
    (lat: number, lng: number) => {
      onLocationChange(lat.toFixed(6), lng.toFixed(6));
    },
    [onLocationChange],
  );

  const handleSearch = useCallback(
    (lat: number, lng: number, name: string) => {
      onLocationChange(lat.toFixed(6), lng.toFixed(6), name);
    },
    [onLocationChange],
  );

  return (
    <div className="space-y-2">
      <SearchBox onSelect={handleSearch} />
      <div className="h-[300px] w-full overflow-hidden rounded-md border">
        <MapContainer
          center={displayPosition}
          zoom={14}
          className="h-full w-full"
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={displayPosition} onMove={handleMove} />
          <MapController onSearchResult={handleMove} />
        </MapContainer>
      </div>
    </div>
  );
}
