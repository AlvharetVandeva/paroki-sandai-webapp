"use client";

import { useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
// Force initialization of the geocoder control — extends L.Control
import "leaflet-control-geocoder";

// Fix default marker icon (broken in webpack bundling)
const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

const DEFAULT_POSITION: [number, number] = [-1.85, 109.98]; // Kalimantan Barat

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

  return position ? (
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
  ) : null;
}

function SearchControl({ onSelect }: { onSelect: (lat: number, lng: number, name: string) => void }) {
  const map = useMap();

  useEffect(() => {
    const geocoder = (L.Control as any).Geocoder.nominatim();

    const control = (L.Control as any).geocoder({
      query: "",
      placeholder: "Cari lokasi...",
      defaultMarkGeocode: false,
      geocoder,
      collapsed: false,
      position: "topright",
    }) as any;

    (control as any).on("select", (e: any) => {
      const { lat, lng } = e.center;
      const name = e.name;
      map.setView([lat, lng], 15);
      onSelect(lat, lng, name);
    });

    control.addTo(map);

    return () => {
      map.removeControl(control);
    };
  }, [map, onSelect]);

  return null;
}

interface MapPickerProps {
  latitude: string;
  longitude: string;
  onLocationChange: (lat: string, lng: string, address?: string) => void;
}

export default function MapPicker({ latitude, longitude, onLocationChange }: MapPickerProps) {
  const validPosition: [number, number] | null =
    latitude && longitude && !isNaN(Number(latitude)) && !isNaN(Number(longitude))
      ? [Number(latitude), Number(longitude)]
      : null;

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
    <div className="h-[300px] w-full overflow-hidden rounded-md border">
      <MapContainer
        center={validPosition ?? DEFAULT_POSITION}
        zoom={validPosition ? 15 : 6}
        className="h-full w-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={validPosition} onMove={handleMove} />
        <SearchControl onSelect={handleSearch} />
      </MapContainer>
    </div>
  );
}
