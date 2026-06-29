"use client";
import { useAuth } from "@/components/AuthProvider";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar/page";
import { Watch } from "lucide-react";

export default function PaymentLogsPage() {
  const { user, signOut } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [createdBy, setCreatedBy] = useState([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    const { data: logs, error: logError } = await supabase
      .from("PaymentLogs")
      .select(
        `
        *,
         Payments!PaymentLogs_paymentId_fkey(CIN)
      `,
      )
      .order("createdAt", {
        ascending: false,
      });

    console.log(logs, logError);

    setLogs(logs || []);
    setLoading(false);
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-zinc-950">
          <div className="flex flex-col items-center gap-4">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <div className="absolute h-16 w-16 animate-spin rounded-full border-4 border-[#1e6cfc] border-t-transparent"></div>
              <div className="h-8 w-8 rounded-full bg-[#ffc600] animate-pulse"></div>
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Loading payment logs...
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="p-6 mt-20">
        <div className="flex justify-between mb-6">
          <h1 className="text-3xl font-bold">Payment Logs</h1>
        </div>

        <div className="bg-white rounded-xl shadow border overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr className="dark:text-gray-700">
                <th className="p-4 text-left">Date</th>

                <th className="p-4 text-left">Created By</th>

                <th className="p-4 text-left">Action</th>

                <th className="p-4 text-left">Amount</th>

                <th className="p-4 text-left">Description</th>

                <th className="p-4 text-left">CIN</th>
              </tr>
            </thead>

            <tbody>
              {logs.map((log, i) => (
                <tr key={log.id} className="border-t">
                  <td className="p-4 dark:text-gray-700">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>

                  <td className="p-4 dark:text-gray-700">{log.createdBy}</td>

                  <td className="p-4 dark:text-gray-700">{log.action}</td>

                  <td className="p-4 dark:text-gray-700">₹{log.amount || 0}</td>

                  <td className="p-4 dark:text-gray-700">{log.description}</td>

                  <td className="p-4 dark:text-gray-700">
                    {log.Payments?.CIN || "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
