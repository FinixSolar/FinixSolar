"use client";

import { useAuth } from "@/components/AuthProvider";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar/page";

export default function PaymentDetails() {
  const { user, signOut } = useAuth();
  const [role, setRole] = useState("viewer");
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState(null);
  const [installments, setInstallments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [client, setClient] = useState(null);

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
    if (id) {
      fetchData();
    }
  }, [id]);

  async function fetchData() {
    try {
      setLoading(true);

      // Fetch Payment
      const { data: paymentData, error: paymentError } = await supabase
        .from("Payments")
        .select("*")
        .eq("id", id)
        .single();

      if (paymentError) throw paymentError;
      setPayment(paymentData);

      // Fetch Client Info
      const { data: clientData } = await supabase
        .from("Clients")
        .select(
          "id, consumerName, contactPersonName, contactPersonNumber, location",
        )
        .eq("CIN", paymentData.CIN)
        .single();
      setClient(clientData);

      // Fetch Installments
      const { data: installmentData } = await supabase
        .from("PaymentInstallments")
        .select("*")
        .eq("paymentId", id)
        .order("installmentNo");

      setInstallments(installmentData || []);

      // Fetch Transactions
      const { data: transactionData } = await supabase
        .from("PaymentTransactions")
        .select("*")
        .eq("paymentId", id)
        .order("createdAt", {
          ascending: false,
        });

      // Fetch Receipts
      const { data: receiptsData } = await supabase
        .from("Receipts")
        .select("*")
        .eq("paymentId", id);

      // Map receipt data
      const receiptMap = {};
      receiptsData?.forEach((r) => {
        receiptMap[r.transactionId] = {
          id: r.id,
          receiptNumber: r.receiptNumber,
        };
      });

      // Merge receipts into transactions
      const mergedTransactions = (transactionData || []).map((txn) => ({
        ...txn,
        receiptId: receiptMap[txn.id]?.id || null,
        receiptNumber: receiptMap[txn.id]?.receiptNumber || null,
      }));

      setTransactions(mergedTransactions);
    } catch (err) {
      console.log(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Calculate stats dynamically
  const totalInstallments = installments.length;
  const paidInstallments = installments.filter(
    (i) => i.status === "Paid",
  ).length;
  const pendingInstallments = installments.filter(
    (i) => i.status === "Pending" || i.status === "Partially Paid",
  ).length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueInstallments = installments.filter((i) => {
    if (i.status === "Paid") return false;
    const dueDate = new Date(i.dueDate);
    return dueDate < today;
  }).length;

  const nextEMI = installments.find((i) => i.status !== "Paid");
  const nextEMIAmount = nextEMI
    ? Number((nextEMI.amount - ((i) => i.paidAmount || 0)(nextEMI)).toFixed(2))
    : 0;
  // wait, the expression (i => i.paidAmount || 0)(nextEMI) is correct or nextEMI.paidAmount can be used directly:
  const actualNextEMIAmount = nextEMI
    ? Number((nextEMI.amount - (nextEMI.paidAmount || 0)).toFixed(2))
    : 0;
  const nextEMIDueDate = nextEMI ? nextEMI.dueDate : "N/A";

  function getStatusBadgeClass(status) {
    switch (status) {
      case "Paid":
        return "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30";
      case "Partially Paid":
        return "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30";
      case "Overdue":
        return "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/30";
      default:
        return "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700";
    }
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
              Loading payment details...
            </p>
          </div>
        </div>
      </>
    );
  }

  if (!payment) {
    return (
      <>
        <Navbar />
        <div className="p-6 mt-20 text-center text-slate-500">
          Payment not found.
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="p-6 max-w-7xl mx-auto space-y-6 mt-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b dark:border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">
                Payment Details
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(payment.paymentStatus)}`}
              >
                {payment.paymentStatus}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              CIN:{" "}
              <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">
                {payment.CIN}
              </span>
              {client && ` • ${client.consumerName}`}
            </p>
          </div>

          <div className="flex gap-3">
            <div className="flex gap-3">
              <Link
                href="/payments"
                className="px-4 py-2 border dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition text-sm font-semibold"
              >
                All Payments
              </Link>

              {["developer", "admin", "sales"].includes(role) && (
                <div className="flex items-center justify-center">
                  {payment.remainingAmount > 0 && (
                    <Link
                      href={`/payments/${id}/receive`}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl transition text-sm font-semibold shadow-lg shadow-blue-500/10 ml-4"
                    >
                      Receive Payment
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Key Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Total Contract Value
            </p>
            <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">
              ₹{payment.totalCost?.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Total Collected
            </p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-450 mt-1">
              ₹{(payment.payedAmount || 0).toLocaleString("en-IN")}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Remaining Balance
            </p>
            <p className="text-2xl font-black text-rose-600 dark:text-rose-450 mt-1">
              ₹{payment.remainingAmount?.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Quotation Limit
            </p>
            <p className="text-2xl font-black text-slate-700 dark:text-slate-300 mt-1">
              ₹{payment.quotationAmount?.toLocaleString("en-IN") || "-"}
            </p>
          </div>
        </div>

        {/* Client & Installment Details Dashboard */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Client & Mode Specs */}
          <div className="bg-white dark:bg-slate-900 border dark:border-slate-800/80 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              Account Details
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b dark:border-slate-800 pb-2">
                <span className="text-slate-500">Contact Person</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {client?.contactPersonName || "-"}
                </span>
              </div>
              <div className="flex justify-between border-b dark:border-slate-800 pb-2">
                <span className="text-slate-500">Contact Number</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {client?.contactPersonNumber || "-"}
                </span>
              </div>
              <div className="flex justify-between border-b dark:border-slate-800 pb-2">
                <span className="text-slate-500">Client Location</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 max-w-37.5 truncate text-right">
                  {client?.location || "-"}
                </span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-slate-500">Payment Strategy</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {payment.type}
                </span>
              </div>
            </div>
          </div>

          {/* ERP Installment Specs (Only if Installment Payment Type) */}
          {payment.type === "Installment" ? (
            <div className="bg-white dark:bg-slate-900 border dark:border-slate-800/80 rounded-2xl p-6 space-y-4 md:col-span-2">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                EMI Installment KPI Metrics
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/10 rounded-xl p-3 text-center">
                  <p className="text-[10px] uppercase font-bold text-slate-400">
                    Total EMIs
                  </p>
                  <p className="text-xl font-extrabold text-slate-700 dark:text-slate-200 mt-1">
                    {totalInstallments}
                  </p>
                </div>
                <div className="bg-emerald-50/40 dark:bg-emerald-950/10 rounded-xl p-3 text-center">
                  <p className="text-[10px] uppercase font-bold text-emerald-600">
                    Paid EMIs
                  </p>
                  <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                    {paidInstallments}
                  </p>
                </div>
                <div className="bg-amber-50/40 dark:bg-amber-950/10 rounded-xl p-3 text-center">
                  <p className="text-[10px] uppercase font-bold text-amber-600">
                    Pending EMIs
                  </p>
                  <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                    {pendingInstallments}
                  </p>
                </div>
                <div className="bg-rose-50/40 dark:bg-rose-950/10 rounded-xl p-3 text-center">
                  <p className="text-[10px] uppercase font-bold text-rose-600">
                    Overdue EMIs
                  </p>
                  <p className="text-xl font-extrabold text-rose-600 dark:text-rose-450 mt-1">
                    {overdueInstallments}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t dark:border-slate-800 pt-4 text-sm">
                <div>
                  <span className="text-slate-500">Next Due EMI Amount:</span>
                  <p className="text-lg font-bold text-slate-800 dark:text-white mt-0.5">
                    ₹{actualNextEMIAmount.toLocaleString("en-IN")}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Next EMI Due Date:</span>
                  <p className="text-lg font-bold text-slate-800 dark:text-white mt-0.5">
                    {nextEMIDueDate !== "N/A"
                      ? new Date(nextEMIDueDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "N/A / Fully Paid"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border dark:border-slate-800/80 rounded-2xl p-6 flex flex-col justify-center items-center md:col-span-2 text-center text-slate-500 text-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                />
              </svg>
              No payment installments scheduled. Payment type is set to{" "}
              {payment.type}.
            </div>
          )}
        </div>

        {/* Installments Table */}
        {payment.type === "Installment" && installments.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border dark:border-slate-800/80 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
              Installment Schedule
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b dark:border-slate-800 text-slate-400 font-semibold">
                    <th className="py-3 px-4">EMI No</th>
                    <th className="py-3 px-4">Scheduled Amount</th>
                    <th className="py-3 px-4">Paid Amount</th>
                    <th className="py-3 px-4">Remaining</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Paid On</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-800 text-slate-750 dark:text-slate-350">
                  {installments.map((item) => {
                    const remaining = Number(
                      (item.amount - (item.paidAmount || 0)).toFixed(2),
                    );
                    const isOverdue =
                      item.status !== "Paid" && new Date(item.dueDate) < today;

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition"
                      >
                        <td className="py-3.5 px-4 font-semibold">
                          EMI #{item.installmentNo}
                        </td>
                        <td className="py-3.5 px-4">
                          ₹{item.amount.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4 text-emerald-600 font-medium">
                          ₹{(item.paidAmount || 0).toLocaleString("en-IN")}
                        </td>
                        <td
                          className={`py-3.5 px-4 font-semibold ${remaining > 0 ? "text-rose-600" : "text-slate-400"}`}
                        >
                          ₹{remaining.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4">
                          {new Date(item.dueDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
                              item.status === "Paid"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                                : item.status === "Partially Paid"
                                  ? "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                                  : isOverdue
                                    ? "bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-200"
                                    : "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            {isOverdue ? "Overdue" : item.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 text-xs">
                          {item.paidOn
                            ? new Date(item.paidOn).toLocaleString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Transaction History Section */}
        <div className="bg-white dark:bg-slate-900 border dark:border-slate-800/80 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
            Transaction History
          </h2>
          {transactions.length === 0 ? (
            <p className="text-slate-500 text-sm">
              No payment transactions recorded.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b dark:border-slate-800 text-slate-400 font-semibold">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Receipt No</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Reference No</th>
                    <th className="py-3 px-4">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-800 text-slate-750 dark:text-slate-350">
                  {transactions.map((txn) => (
                    <tr
                      key={txn.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition"
                    >
                      <td className="py-3.5 px-4">
                        {new Date(txn.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold">
                        {txn.receiptNumber ? (
                          <Link
                            href={`/payments/${id}/receipt/${txn.receiptId}`}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-450 dark:hover:text-blue-400 hover:underline"
                          >
                            #{txn.receiptNumber}
                          </Link>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-white">
                        ₹{txn.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4">{txn.method}</td>
                      <td className="py-3.5 px-4 text-xs font-mono">
                        {txn.referenceNo || "-"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-xs">
                        {txn.notes || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
