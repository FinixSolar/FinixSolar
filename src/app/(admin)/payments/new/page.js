"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar/page";
import { useAuth } from "@/components/AuthProvider";
import { createPaymentLog } from "@/lib/paymentLogs";

export default function NewPayment() {
  const router = useRouter();
  const { user } = useAuth();

  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState({
    type: "",
    totalCost: "",
    payedAmount: "",
    remainingAmount: "",
    quotationAmount: "",
  });

  const [form, setForm] = useState({
    totalCost: "",
    quotationAmount: "",
    type: "Cash", // Cash, Loan, Installment
    installmentCount: 0,
    downPayment: 0,
    downPaymentMethod: "Cash", // Cash, UPI, Cheque, Card, Bank Transfer
    downPaymentReferenceNo: "",
    notes: "",
  });

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    try {
      const { data, error } = await supabase
        .from("Clients")
        .select("id, CIN, consumerName");
      if (error) throw error;
      setClients(data || []);
    } catch (err) {
      console.log("Error fetching clients:", err);
    }
  }

  const filteredClients = clients.filter(
    (c) =>
      c.CIN?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.consumerName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const fillFormAuto = async (client) => {
    const { data: paymentData, error: paymentError } = await supabase
      .from("Payments")
      .select("*")
      .eq("CIN", client.CIN)
      .single();

    console.log("Payment", paymentData);

    setPayment(paymentData || null);
    // // Update form Automatically
    // form.totalCost = pa
  };

  async function savePayment() {
    if (!selectedClient) {
      alert("Please select a client first");
      return;
    }

    const totalCost = Number(form.totalCost);
    const quotationAmount = Number(form.quotationAmount);
    const downPayment = Number(form.downPayment || 0);
    const installmentCount = Number(form.installmentCount || 0);

    if (isNaN(totalCost) || totalCost <= 0) {
      alert("Please enter a valid total cost");
      return;
    }

    if (isNaN(quotationAmount) || quotationAmount < 0) {
      alert("Please enter a valid quotation amount");
      return;
    }

    if (downPayment < 0 || downPayment > totalCost) {
      alert("Down payment cannot be negative or exceed the total cost");
      return;
    }

    if (form.type === "Installment" && installmentCount <= 0) {
      alert("Please enter a valid installment count (> 0)");
      return;
    }

    try {
      setLoading(true);

      const remainingAmount = totalCost - downPayment;
      let paymentStatus = "Pending";
      if (downPayment > 0) {
        paymentStatus = remainingAmount === 0 ? "Paid" : "Partially Paid";
      }

      // Calculate next due date for the payment header
      let nextDueDate = null;
      if (
        form.type === "Installment" &&
        installmentCount > 0 &&
        remainingAmount > 0
      ) {
        const d = new Date();
        d.setMonth(d.getMonth() + 1);
        nextDueDate = d.toISOString().split("T")[0];
      }

      // 1. Insert Payment
      const { data: payment, error: paymentError } = await supabase
        .from("Payments")
        .insert({
          clientId: selectedClient.id,
          CIN: selectedClient.CIN,
          type: form.type,
          totalCost,
          quotationAmount,
          payedAmount: downPayment,
          remainingAmount,
          paymentStatus,
          installmentCount: form.type === "Installment" ? installmentCount : 0,
          nextDueDate,
          notes: form.notes,
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // 2. Insert Installments if Installment type and balance remains
      if (
        form.type === "Installment" &&
        installmentCount > 0 &&
        remainingAmount > 0
      ) {
        const installmentAmt = remainingAmount / installmentCount;
        const installmentRows = [];

        for (let i = 1; i <= installmentCount; i++) {
          const dueDate = new Date();
          dueDate.setMonth(dueDate.getMonth() + i);

          installmentRows.push({
            paymentId: payment.id,
            installmentNo: i,
            amount: Number(installmentAmt.toFixed(2)),
            dueDate: dueDate.toISOString().split("T")[0],
            status: "Pending",
            paidAmount: 0,
          });
        }

        const { error: instError } = await supabase
          .from("PaymentInstallments")
          .insert(installmentRows);

        if (instError) throw instError;
      }

      // 3. Create Transaction, Receipt, and Log for Down Payment if > 0
      if (downPayment > 0) {
        const { data: transaction, error: txnError } = await supabase
          .from("PaymentTransactions")
          .insert({
            paymentId: payment.id,
            installmentId: null,
            amount: downPayment,
            paymenttype: form.type,
            method: form.downPaymentMethod,
            referenceNo: form.downPaymentReferenceNo || null,
            notes: "Down Payment",
            createdBy: user?.user_metadata.full_names,
          })
          .select()
          .single();

        if (txnError) throw txnError;

        const { data: receipt, error: receiptError } = await supabase
          .from("Receipts")
          .insert({
            transactionId: transaction.id,
            paymentId: payment.id,
          })
          .select()
          .single();

        if (receiptError) throw receiptError;

        await createPaymentLog({
          paymentId: payment.id,
          action: "PAYMENT_RECEIVED",
          description: `Down payment of ₹${downPayment} received via ${form.downPaymentMethod}`,
          amount: downPayment,
          transactionId: transaction.id,
          receiptId: receipt.id,
          createdBy: user?.user_metadata.full_name,
        });
      } else {
        // Log creation without down payment
        await createPaymentLog({
          paymentId: payment.id,
          action: "PAYMENT_CREATED",
          description: `Payment created with ₹0 down payment`,
          createdBy: user?.user_metadata.full_name,
        });
      }

      alert("Payment and schedule successfully created!");
      router.push(`/payments/${payment.id}`);
    } catch (err) {
      console.log(err);
      alert(err.message || "Failed to create payment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 mt-20">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">
                Create Client Payment
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Define the payment structure, schedule installments, or record
                initial down payments.
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="text-xs sm:text-sm font-medium px-4 py-2 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Back
            </button>
          </div>

          <div className="space-y-6">
            {/* Search Client */}
            <div className="relative">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Client (Search by CIN or Name) *
              </label>
              {selectedClient ? (
                <div className="flex items-center justify-between p-4 border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white">
                      {selectedClient.consumerName}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-mono mt-0.5">
                      CIN: {selectedClient.CIN}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedClient(null);
                      setSearchTerm("");
                    }}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Change Client
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Type CIN or consumer name..."
                    value={searchTerm}
                    onFocus={() => setShowDropdown(true)}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowDropdown(true);
                    }}
                    className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                  {showDropdown && searchTerm && (
                    <div className="absolute z-10 w-full bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl shadow-lg mt-1 max-h-60 overflow-y-auto">
                      {filteredClients.length === 0 ? (
                        <div className="p-4 text-sm text-slate-500 dark:text-slate-400">
                          No clients found
                        </div>
                      ) : (
                        filteredClients.map((client) => (
                          <div
                            key={client.id}
                            onClick={() => {
                              setSelectedClient(client);
                              fillFormAuto(client);
                              setShowDropdown(false);
                            }}
                            className="p-3 hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer border-b last:border-b-0 dark:border-slate-700"
                          >
                            <p className="font-semibold text-slate-800 dark:text-white text-sm">
                              {client.consumerName}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                              CIN: {client.CIN}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Total Cost */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Total Cost (₹) *
                </label>
                <input
                  type="number"
                  placeholder="e.g. 100000"
                  value={form.totalCost}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      totalCost: e.target.value,
                    })
                  }
                  className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>

              {/* Quotation Amount */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Quotation Amount (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 95000"
                  value={form.quotationAmount}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      quotationAmount: e.target.value,
                    })
                  }
                  className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>

              {/* Payment Type */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Payment Schedule Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      type: e.target.value,
                      installmentCount:
                        e.target.value === "Installment" ? 5 : 0,
                    })
                  }
                  className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                >
                  <option value="Cash">Cash (Immediate/No Installments)</option>
                  <option value="Installment">Installment Scheme (EMIs)</option>
                  <option value="Loan">Financed / Loan Payment</option>
                </select>
              </div>

              {/* Installment Count (only if Installment) */}
              {form.type === "Installment" && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Installment Count (EMIs) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.installmentCount}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        installmentCount: e.target.value,
                      })
                    }
                    className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
              )}
            </div>

            {/* Down Payment Section */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
              <h3 className="font-bold text-slate-800 dark:text-white text-md mb-4">
                Down Payment / Initial Payment
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Down Payment Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={form.downPayment}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        downPayment: e.target.value,
                      })
                    }
                    className="w-full border rounded-xl p-2.5 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>

                {Number(form.downPayment) > 0 && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        Payment Method
                      </label>
                      <select
                        value={form.downPaymentMethod}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            downPaymentMethod: e.target.value,
                          })
                        }
                        className="w-full border rounded-xl p-2.5 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                      >
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="Cheque">Cheque</option>
                        <option value="Card">Card</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                      </select>
                    </div>

                    {form.downPaymentMethod !== "Cash" && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                          Reference No / Txn ID
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. TXN987654"
                          value={form.downPaymentReferenceNo}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              downPaymentReferenceNo: e.target.value,
                            })
                          }
                          className="w-full border rounded-xl p-2.5 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Notes / Terms
              </label>
              <textarea
                rows={3}
                placeholder="Add special terms, loan detail notes, or description here..."
                value={form.notes}
                onChange={(e) =>
                  setForm({
                    ...form,
                    notes: e.target.value,
                  })
                }
                className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>

            <div>
              <p>
                *Double-check before you click. Ensure all payment info is
                accurate before finalizing. It can not be be undone.
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex justify-end">
              <button
                onClick={savePayment}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-blue-500/20 hover:scale-[1.01] active:scale-[0.99] transition duration-150 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Payment & Schedule"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
