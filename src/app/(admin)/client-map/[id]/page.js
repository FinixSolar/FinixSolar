"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar/page";

const ClientMap = dynamic(() => import("@/components/ClientMap"), {
  ssr: false,
});

export default function ClientMapPage() {
  const params = useParams();

  const [selectedClient, setSelectedClient] = useState(null);
  const [allClients, setAllClients] = useState([]);
  const [nearestClients, setNearestClients] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const fetchData = async () => {
    const { data } = await supabase.from("Clients").select(`
  id,
  CIN,
  consumerName,
  address,
  latitude,
  longitude,
  googlemaplink
`);

    if (!data) return;

    // const selected = data.find((c) => String(c.id) === String(params.id));
    const selected = data.find((c) => String(c.id) === String(params.id));

    if (!selected) {
      return;
    }

    setSelectedClient(selected);

    setSelectedClient(selected);
    setAllClients(data);

    const nearby = data
      .filter((c) => c.id !== selected.id)
      .map((c) => ({
        ...c,
        distance: getDistance(
          selected.latitude,
          selected.longitude,
          c.latitude,
          c.longitude,
        ),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);

    setNearestClients(nearby);
  };

  if (!selectedClient) {
    return <div className="p-10">Loading...</div>;
  }

  return (
    <div>
      <Navbar />
      <div className="p-6 bg-gray-50 min-h-screen pt-25">
        {/* Client Header */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {selectedClient.consumerName}
              </h1>

              <p className="text-gray-600 mt-1">CIN: {selectedClient.CIN}</p>

              <a
                href={selectedClient.googlemaplink}
                target="_blank"
                rel="noopener noreferrer"
                className="max-w-max mt-3 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium flex justify-between items-center gap-2"
              >
                <span> Open in Google Maps</span>
                <span className="material-symbols-outlined">open_in_new</span>
              </a>

              <p className="text-gray-500 text-sm mt-2">
                {selectedClient.address}
              </p>
            </div>

            <div className="mt-4 md:mt-0">
              <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                Client Location
              </span>
            </div>
          </div>
        </div>

        {/* Map + Nearby */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map */}
          <div className=" lg:col-span-3 bg-white rounded-xl shadow overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-lg text-gray-800">
                Client Network Map
              </h2>
            </div>

            <div className="h-162.5">
              <ClientMap
                selectedClient={selectedClient}
                clients={allClients}
                nearestClients={nearestClients}
              />
            </div>
          </div>

          {/* Nearby Clients */}
          <div className="bg-white rounded-xl shadow">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-lg text-gray-800">
                Nearby Clients
              </h2>
            </div>

            <div className="max-h-162.5 overflow-y-auto">
              {nearestClients.map((client, index) => (
                <div
                  key={client.id}
                  className="p-4 border-b hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">
                        {client.consumerName}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">{client.CIN}</p>
                      <a
                        href={client.googlemaplink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className=" mt-3 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium flex justify-between items-center gap-2"
                      >
                        <span> Open in Google Maps</span>
                        <span className="material-symbols-outlined">
                          open_in_new
                        </span>
                      </a>
                    </div>

                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                      {client.distance.toFixed(1)} km
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                    {client.location}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
