"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { Fragment } from "react";

import "leaflet/dist/leaflet.css";

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Auto fit all markers
function FitBounds({ selectedClient, nearestClients }) {
  const map = useMap();

  useEffect(() => {
    const points = [
      [Number(selectedClient.latitude), Number(selectedClient.longitude)],
      ...nearestClients.map((client) => [
        Number(client.latitude),
        Number(client.longitude),
      ]),
    ];

    if (points.length > 0) {
      map.fitBounds(points, {
        padding: [50, 50],
      });
    }
  }, [map, selectedClient, nearestClients]);

  return null;
}

export default function ClientMap({ selectedClient, nearestClients = [] }) {
  const lat = Number(selectedClient.latitude);
  const lng = Number(selectedClient.longitude);

  const selectedIcon = new L.Icon({
    iconUrl: "/icons/red-marker.png",
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });

  const nearestIcon = new L.Icon({
    iconUrl: "/icons/yellow-marker.png",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });

  const radius =
    nearestClients.length > 0
      ? nearestClients[nearestClients.length - 1].distance * 1000
      : 5000;

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={1}
      style={{
        height: "650px",
        width: "100%",
      }}
    >
      <FitBounds
        selectedClient={selectedClient}
        nearestClients={nearestClients}
      />

      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />

      {/* Selected Client */}
      <Marker position={[lat, lng]} icon={selectedIcon}>
        <Tooltip permanent direction="top" offset={[0, -20]}>
          <strong>{selectedClient.consumerName}</strong>
        </Tooltip>

        <Popup>
          <div className="min-w-[200px]">
            <h3 className="font-bold text-lg">{selectedClient.consumerName}</h3>

            <p>CIN: {selectedClient.CIN}</p>

            <p className="text-red-600 font-medium mt-2">Selected Client</p>
          </div>
        </Popup>
      </Marker>

      {/* Coverage Circle */}
      <Circle
        center={[lat, lng]}
        radius={1000}
        pathOptions={{
          color: "#ef4444",
          fillColor: "#ef4444",
          fillOpacity: 0.15,
          weight: 4,
          opacity: 1,
        }}
      />

      {/* Nearby Clients */}
      {nearestClients.map((client) => {
        const clientLat = Number(client.latitude);
        const clientLng = Number(client.longitude);

        if (isNaN(clientLat) || isNaN(clientLng)) {
          return null;
        }

        return (
          <Fragment key={client.id}>
            <Polyline
              positions={[
                [lat, lng],
                [clientLat, clientLng],
              ]}
            />

            {/* Marker */}
            <Marker position={[clientLat, clientLng]} icon={nearestIcon}>
              <Popup>
                <div className="min-w-[220px]">
                  <h3 className="font-bold">{client.consumerName}</h3>

                  <p>CIN: {client.CIN}</p>

                  <p>Address: {client.address}</p>

                  <p className="mt-2 text-blue-600 font-medium">
                    Distance: {client.distance.toFixed(2)} km
                  </p>

                  <button
                    className="mt-3 px-3 py-1 bg-blue-600 text-white rounded flex justify-between items-center gap-2"
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps/search/?api=1&query=${clientLat},${clientLng}`,
                        "_blank",
                      )
                    }
                  >
                    <span> Open in Google Maps</span>
                    <span className="material-symbols-outlined">
                      open_in_new
                    </span>
                  </button>
                </div>
              </Popup>
            </Marker>
          </Fragment>
        );

        // return (
        //   <div key={client.id}>
        //     {/* Line */}
        //     <Polyline
        //       positions={[
        //         [lat, lng],
        //         [clientLat, clientLng],
        //       ]}
        //       pathOptions={{
        //         color: "#f59e0b",
        //         weight: 2,
        //         opacity: 0.5,
        //         dashArray: "5,10",
        //       }}
        //     />
        //   </div>
        // );
      })}
    </MapContainer>
  );
}
