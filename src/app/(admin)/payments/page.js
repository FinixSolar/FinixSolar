"use client";

import { useAuth } from "@/components/AuthProvider";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Navbar from "@/components/Navbar/page";
import { useRouter } from "next/navigation";

export default function PaymentsPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [role, setRole] = useState("viewer");
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRole();
    }
  }, [user]);
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

  useEffect(() => {
    fetchPayments();
  }, []);

  async function fetchPayments() {
    try {
      setLoading(true);
      const { data } = await supabase
        .from("Payments")
        .select("*")
        .order("createdAt", { ascending: false });

      setPayments(data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <div className="absolute h-16 w-16 animate-spin rounded-full border-4 border-[#1e6cfc] border-t-transparent"></div>
            <div className="h-8 w-8 rounded-full bg-[#ffc600] animate-pulse"></div>
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Fetching Payments Detials....
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Navbar />
      <div className="flex justify-between mb-5 mt-20">
        <h1 className="text-3xl font-bold">Payments</h1>

        {["developer", "admin", "sales"].includes(role) && (
          <Link
            href="/payments/new"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            New Payment
          </Link>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b dark:border-slate-800 text-slate-400 font-semibold">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">CIN</th>
              <th className="py-3 px-4">Total</th>
              <th className="py-3 px-4">Paid</th>
              <th className="py-3 px-4">Remaining</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-slate-800 text-slate-750 dark:text-slate-350">
            {payments.map((p) => (
              <tr
                key={p.id}
                onClick={() => router.push(`/payments/${p.id}`)}
                className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition"
              >
                <td className="py-3.5 px-4">
                  {new Date(p.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="py-3.5 px-4 font-mono font-bold">
                  <span className="text-blue-600 hover:text-blue-700 dark:text-blue-450 dark:hover:text-blue-400 hover:underline">
                    {p.CIN}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-white">
                  ₹{p.totalCost.toLocaleString("en-IN") || "-"}
                </td>
                <td className="py-3.5 px-4 font-extrabold text-emerald-600 dark:text-emerald-400">
                  {p.payedAmount.toLocaleString("en-IN")}
                </td>
                <td className="py-3.5 px-4 font-extrabold text-amber-600 dark:text-amber-400">
                  {p.remainingAmount.toLocaleString("en-IN") || "-"}
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold ${
                      p.paymentStatus === "Paid"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                        : p.paymentStatus === "Partially Paid"
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                            ? "bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-200"
                            : p.paymentStatus === "Pending"
                          : "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {p.paymentStatus.toLocaleString("en-IN") || "-"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
