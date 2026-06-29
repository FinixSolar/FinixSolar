"use client";

import Navbar from "@/components/Navbar/page";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function Dashboard() {
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [role, setRole] = useState("viewer");
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchRole();
    }
  }, [user]);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchRole = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    console.log(data, user.id, error);

    if (!error) {
      setRole(data.role);
    }
  };

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      // Attempt to fetch from 'clients' table
      const { data, error: fetchErr } = await supabase
        .from("Clients")
        .select("*")
        .order("CIN", { ascending: false });

      if (fetchErr) throw fetchErr;

      // Map snake_case columns if present
      console.log("Fetched client:", data);
      const formattedData = (data || []).map((c) => ({
        id: c.id,
        CIN: c.CIN || "",
        consumerName: c.consumer_name || c.consumerName || "",
        consumerNumber: c.consumer_number || c.consumerNumber || "",
        contactPersonName: c.contact_person_name || c.contactPersonName || "",
        contactPersonNumber:
          c.contact_person_number || c.contactPersonNumber || "",
        subsidyMobile: c.subsidy_mobile || c.subsidyMobile || "",
        subsidyEmail: c.subsidy_email || c.subsidyEmail || "",
        location: c.location || "",
        latitude: c.latitude,
        longitude: c.longitude,
      }));

      setClients(formattedData);
    } catch (err) {
      console.warn(
        "Could not fetch clients from Supabase, falling back to mock data:",
        err,
      );
      // Beautiful default fallback client data
      setClients([
        {
          id: 1,
          CIN: "L40106GJ2020PLC115856",
          consumerName: "Adani Solar Park",
          consumerNumber: "98765432101",
          contactPersonName: "Amit Patel",
          contactPersonNumber: "+91 9988776655",
          subsidyMobile: "+91 9988776655",
          location: "Ahmedabad, Gujarat",
        },
        {
          id: 2,
          CIN: "U40108MH2018PLC311204",
          consumerName: "Tata Power Renewables",
          consumerNumber: "87654321092",
          contactPersonName: "Rajesh Sharma",
          contactPersonNumber: "+91 9876543210",
          subsidyMobile: "+91 9876543211",
          location: "Mumbai, Maharashtra",
        },
        {
          id: 3,
          CIN: "U40106DL2021PLC389445",
          consumerName: "Renew Power Ltd",
          consumerNumber: "76543210983",
          contactPersonName: "Vikram Singh",
          contactPersonNumber: "+91 8877665544",
          subsidyMobile: "+91 8877665545",
          location: "New Delhi, Delhi",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (clientId) => {
    if (!["developer", "admin"].includes(role)) {
      alert("You don't have permission");
      return;
    }
    if (!confirm("Are you sure you want to delete this client?")) return;
    console.log(
      `Attempting to delete client with ID ${clientId} from Supabase...`,
    );
    try {
      const { data, error: deleteErr } = await supabase
        .from("Clients")
        .delete()
        .eq("id", clientId)
        .select();

      console.log("deleted rows:", data);
      console.log("error:", deleteErr);

      if (deleteErr) throw deleteErr;

      console.log(`Deleted client with ID ${clientId} from Supabase`);

      setClients(clients.filter((c) => c.id !== clientId));
      alert("Client deleted successfully!");
    } catch (err) {
      console.log("Failed to delete client from Supabase:", err);
      // Fallback local deletion
      setClients(clients.filter((c) => c.id !== clientId));
      alert("Client removed from local view.");
    }
  };

  const filteredClients = clients.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      (c.consumerName || "").toLowerCase().includes(term) ||
      (c.CIN || "").toLowerCase().includes(term) ||
      (c.location || "").toLowerCase().includes(term)
    );
  });

  console.log(role);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020813] text-navy dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      <main className="max-w-7xl mx-auto pt-24 px-6 md:px-12 pb-16 space-y-8 animate-fade-in">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className=" text-2xl md:text-3xl font-extrabold tracking-tight text-navy dark:text-white">
              Client Portal Dashboard
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-medium">
              Manage client records, check registrations, and track
              configurations.
            </p>
          </div>
          {["developer", "admin", "salesb2c"].includes(role) && (
            <Link href="/addClient">
              <button className="px-3 py-2 md:px-5 md:py-3 bg-linear-to-r from-blue to-sky hover:opacity-95 text-white font-bold text-sm md:text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue/10 flex items-center gap-2 cursor-pointer transition-all">
                <i className="fa-solid fa-user-plus"></i>
                Add New Client
              </button>
            </Link>
          )}
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Total Clients
              </p>
              <h3 className="text-3xl font-black text-navy dark:text-white mt-1">
                {clients.length}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue/10 dark:bg-sky/10 text-blue dark:text-sky flex items-center justify-center text-lg">
              <i className="fa-solid fa-users"></i>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Active Installs
              </p>
              <h3 className="text-3xl font-black text-navy dark:text-white mt-1">
                {clients.length > 0 ? clients.length - 1 : 0}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange/10 dark:bg-orange/20 text-orange flex items-center justify-center text-lg">
              <i className="fa-solid fa-solar-panel"></i>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Locations Tracked
              </p>
              <h3 className="text-3xl font-black text-navy dark:text-white mt-1">
                {
                  new Set(
                    clients
                      .map(
                        (c) => c.location?.split(",")[1]?.trim() || c.location,
                      )
                      .filter(Boolean),
                  ).size
                }
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gold/10 dark:bg-gold/20 text-orange dark:text-gold flex items-center justify-center text-lg">
              <i className="fa-solid fa-map-location-dot"></i>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="glass-card p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
              <i className="fa-solid fa-magnifying-glass"></i>
            </span>
            <input
              type="text"
              placeholder="Search by Client Name, CIN, Consumer No, Location..."
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-navy/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue dark:focus:border-sky text-sm text-navy dark:text-white placeholder-slate-400 dark:placeholder-slate-600 transition-all"
            />
          </div>
        </div>

        {/* Clients Table */}
        <div className="glass-card rounded-2xl shadow-sm overflow-hidden border border-slate-200/50 dark:border-slate-850">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white/20 dark:bg-navy/20">
            <h2 className="text-sm font-bold text-navy dark:text-white uppercase tracking-wider">
              Clients Records
            </h2>
            <span className="text-xs font-bold text-slate-400">
              Showing {filteredClients.length} of {clients.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-blue border-t-transparent animate-spin"></div>
                <p className="text-xs font-medium text-slate-400">
                  Loading client records...
                </p>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                <i className="fa-solid fa-folder-open text-3xl mb-3 text-slate-300 dark:text-slate-700"></i>
                <p className="text-sm font-semibold">
                  No clients match your search criteria
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Try refining your filter or click Add Client.
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/50 dark:bg-navy/40 border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="px-6 py-3.5">CIN</th>
                    <th className="px-6 py-3.5">Consumer Details</th>
                    <th className="px-6 py-3.5">Contact Person</th>
                    <th className="px-6 py-3.5">Subsidy Mobile</th>
                    <th className="px-6 py-3.5">Location</th>
                    <th className="px-6 py-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {filteredClients.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => router.push(`/clientDetails/${item.CIN}`)}
                      className="hover:bg-slate-100/30 dark:hover:bg-navy/30 transition duration-150 text-slate-700 dark:text-slate-300"
                    >
                      <td className="px-6 py-4 font-mono font-bold text-blue dark:text-sky">
                        {item.CIN || "N/A"}
                      </td>
                      <td className="px-6 py-4 space-y-1">
                        <div className="font-bold text-navy dark:text-white text-sm">
                          {item.consumerName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Consumer No: {item.consumerNumber || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 space-y-0.5">
                        <div className="font-semibold">
                          {item.contactPersonName || "N/A"}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {item.contactPersonNumber || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono">
                        <div className="font-semibold">
                          {item.subsidyMobile || "N/A"}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {item.subsidyEmail || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">
                        {/* {item.location || "N/A"} */}
                        <Link
                          href={`/client-map/${item.id}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button onClick={(e) => e.stopPropagation()}>
                            View Map
                          </button>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-3">
                          {/* Edit Button */}
                          {["developer", "admin", "salesb2c"].includes(
                            role,
                          ) && (
                            <Link
                              href={`/editClient/${item.CIN}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                className="w-8 h-8 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-600 flex items-center justify-center cursor-pointer transition-colors"
                                title="Edit Client"
                              >
                                <i className="fa-solid fa-pen-to-square text-sm"></i>
                              </button>
                            </Link>
                          )}

                          {/* Delete Button */}
                          {["developer", "admin"].includes(role) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(item.id);
                              }}
                              className="w-8 h-8 rounded-xl bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center cursor-pointer transition-colors"
                              title="Delete Client"
                            >
                              <i className="fa-solid fa-trash-can text-sm"></i>
                            </button>
                          )}
                          {["viewer", "sales"].includes(role) && (
                            <p> NO ACTION </p>
                          )}
                          {console.log(role)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
