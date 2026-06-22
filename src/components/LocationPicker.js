"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState } from "react";

function LocationMarker({ onSelect }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    async click(e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      setPosition(e.latlng);

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`,
        );

        const data = await response.json();

        const addr = data.address || {};

        onSelect({
          latitude: lat,
          longitude: lng,

          houseNo: addr.house_number || addr.building || addr.house_name || "",

          street: addr.road || addr.neighbourhood || addr.suburb || "",

          village: addr.village || addr.town || addr.city || "",

          taluka: addr.subdistrict || addr.municipality || "",

          district: addr.county || addr.state_district || "",

          state: addr.state || "",

          pincode: addr.postcode || "",

          country: addr.country || "",

          fullAddress: data.display_name || "",
        });
      } catch (error) {
        console.error("Reverse Geocoding Error:", error);

        onSelect({
          latitude: lat,
          longitude: lng,
        });
      }
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function LocationPicker({ onSelect }) {
  return (
    <MapContainer
      center={[21.0077, 75.5626]}
      zoom={13}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <LocationMarker onSelect={onSelect} />
    </MapContainer>
  );
}
