"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar/page";

export default function PaymentReports() {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalCollected: 0,
    totalPending: 0,
    totalPayments: 0,
    overdueInstallments: 0,
  });

  const [recentTransactions, setRecentTransactions] = useState([]);
  const [upcomingInstallments, setUpcomingInstallments] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    try {
      setLoading(true);

      // Payments
      const { data: payments } = await supabase.from("Payments").select("*");

      // Transactions
      const { data: transactions } = await supabase
        .from("PaymentTransactions")
        .select("*")
        .order("createdAt", { ascending: false })
        .limit(10);

      // Installments
      const { data: installments } = await supabase
        .from("PaymentInstallments")
        .select("*")
        .order("dueDate", { ascending: true });

      const totalRevenue =
        payments?.reduce((sum, p) => sum + Number(p.totalCost || 0), 0) || 0;

      const totalCollected =
        payments?.reduce((sum, p) => sum + Number(p.payedAmount || 0), 0) || 0;

      const totalPending =
        payments?.reduce((sum, p) => sum + Number(p.remainingAmount || 0), 0) ||
        0;

      const overdueCount =
        installments?.filter(
          (i) => i.status !== "Paid" && new Date(i.dueDate) < new Date(),
        ).length || 0;

      const upcoming =
        installments?.filter((i) => i.status !== "Paid").slice(0, 10) || [];

      setStats({
        totalRevenue,
        totalCollected,
        totalPending,
        totalPayments: payments?.length || 0,
        overdueInstallments: overdueCount,
      });

      setRecentTransactions(transactions || []);
      setUpcomingInstallments(upcoming);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="p-6">Loading...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">Payment Reports</h1>

        {/* Summary Cards */}

        <div className="grid md:grid-cols-5 gap-4">
          <div className="bg-white border rounded-xl p-4 shadow">
            <p className="text-gray-500 text-sm">Total Revenue</p>

            <h2 className="text-2xl font-bold">
              ₹{stats.totalRevenue.toLocaleString()}
            </h2>
          </div>

          <div className="bg-white border rounded-xl p-4 shadow">
            <p className="text-gray-500 text-sm">Collected</p>

            <h2 className="text-2xl font-bold text-green-600">
              ₹{stats.totalCollected.toLocaleString()}
            </h2>
          </div>

          <div className="bg-white border rounded-xl p-4 shadow">
            <p className="text-gray-500 text-sm">Pending</p>

            <h2 className="text-2xl font-bold text-red-600">
              ₹{stats.totalPending.toLocaleString()}
            </h2>
          </div>

          <div className="bg-white border rounded-xl p-4 shadow">
            <p className="text-gray-500 text-sm">Payments</p>

            <h2 className="text-2xl font-bold">{stats.totalPayments}</h2>
          </div>

          <div className="bg-white border rounded-xl p-4 shadow">
            <p className="text-gray-500 text-sm">Overdue EMI</p>

            <h2 className="text-2xl font-bold text-orange-600">
              {stats.overdueInstallments}
            </h2>
          </div>
        </div>

        {/* Recent Transactions */}

        <div className="bg-white border rounded-xl p-5 shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>

          <div className="overflow-x-auto">
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-3">Date</th>

                  <th className="border p-3">Amount</th>

                  <th className="border p-3">Method</th>

                  <th className="border p-3">Reference</th>
                </tr>
              </thead>

              <tbody>
                {recentTransactions.map((txn) => (
                  <tr key={txn.id}>
                    <td className="border p-3">
                      {new Date(txn.createdAt).toLocaleDateString()}
                    </td>

                    <td className="border p-3">₹{txn.amount}</td>

                    <td className="border p-3">{txn.method}</td>

                    <td className="border p-3">{txn.referenceNo || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming EMI */}

        <div className="bg-white border rounded-xl p-5 shadow">
          <h2 className="text-xl font-semibold mb-4">Upcoming Installments</h2>

          <div className="overflow-x-auto">
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-3">EMI No</th>

                  <th className="border p-3">Amount</th>

                  <th className="border p-3">Due Date</th>

                  <th className="border p-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {upcomingInstallments.map((item) => (
                  <tr key={item.id}>
                    <td className="border p-3">{item.installmentNo}</td>

                    <td className="border p-3">₹{item.amount}</td>

                    <td className="border p-3">{item.dueDate}</td>

                    <td className="border p-3">{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
