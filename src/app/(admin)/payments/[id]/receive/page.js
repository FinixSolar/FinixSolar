"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar/page";
import { useAuth } from "@/components/AuthProvider";
import { createPaymentLog } from "@/lib/paymentLogs";

export default function ReceivePaymentPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [installments, setInstallments] = useState([]);
  const [payment, setPayment] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [selectedInstallment, setSelectedInstallment] = useState("");
  const [receiptNo, setReceiptNo] = useState("Auto");

  const [form, setForm] = useState({
    amount: "",
    method: "Cash",
    referenceNo: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPayment();
  }, []);

  async function fetchPayment() {
    try {
      const { data, error } = await supabase
        .from("Payments")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.log(error);
        return;
      }
      setPayment(data);

      const { data: receiptsData } = await supabase
        .from("Receipts")
        .select("*")
        .eq("paymentId", id)
        .order("createdAt", {
          ascending: false,
        });

      setReceipts(receiptsData || []);

      const { data: installmentData, error: installmentError } = await supabase
        .from("PaymentInstallments")
        .select("*")
        .eq("paymentId", id)
        .neq("status", "Paid")
        .order("installmentNo");

      if (installmentError) {
        console.log(installmentError);
      } else {
        setInstallments(installmentData || []);
      }

      const { data: lastReceipt } = await supabase
        .from("Receipts")
        .select("receiptNumber")
        .order("receiptNumber", { ascending: false })
        .limit(1)
        .single();

      if (lastReceipt) {
        setReceiptNo(lastReceipt.receiptNumber + 1);
      }
    } catch (err) {
      console.log(err);
    }
  }

  async function receivePayment() {
    try {
      setLoading(true);

      const amount = Number(form.amount);

      if (!amount || amount <= 0 || isNaN(amount)) {
        alert("Enter valid amount");
        return;
      }

      if (amount > payment.remainingAmount) {
        alert(
          `Amount cannot exceed remaining payment amount of ₹${payment.remainingAmount}`,
        );
        return;
      }

      let installment = null;
      if (payment.type === "Installment") {
        if (!selectedInstallment) {
          alert("Please select an installment for installment payments");
          return;
        }

        // Fetch the latest state of the selected installment
        const { data: instData, error: instErr } = await supabase
          .from("PaymentInstallments")
          .select("*")
          .eq("id", selectedInstallment)
          .single();

        if (instErr || !instData) {
          alert("Selected installment not found");
          return;
        }

        installment = instData;

        if (installment.status === "Paid") {
          alert("This installment is already fully paid");
          return;
        }

        const remainingInstallmentAmt = Number(
          (
            Number(installment.amount) - Number(installment.paidAmount || 0)
          ).toFixed(2),
        );

        if (amount > remainingInstallmentAmt) {
          alert(
            `Amount ₹${amount} exceeds the remaining amount for this installment (₹${remainingInstallmentAmt})`,
          );
          return;
        }
      }

      // Step 1: Insert transaction
      const { data: transaction, error: txnError } = await supabase
        .from("PaymentTransactions")
        .insert({
          paymentId: id,
          installmentId: selectedInstallment || null,
          amount,
          paymenttype: payment.type,
          method: form.method,
          referenceNo: form.referenceNo || null,
          loanprovider: null,
          notes: form.notes,
          createdBy: user?.id,
        })
        .select()
        .single();

      if (txnError) throw txnError;

      // Step 2: Insert Receipt
      const { data: receipt, error: receiptError } = await supabase
        .from("Receipts")
        .insert({
          transactionId: transaction.id,
          paymentId: id,
        })
        .select()
        .single();

      if (receiptError) throw receiptError;

      // Step 3: Insert Payment Log
      const desc = installment
        ? `Received ₹${amount} via ${form.method} for EMI #${installment.installmentNo}`
        : `Received ₹${amount} via ${form.method}`;

      const { error: logError } = await supabase.from("PaymentLogs").insert({
        paymentId: id,
        action: "PAYMENT_RECEIVED",
        description: desc,
        amount,
        transactionId: transaction.id,
        receiptId: receipt.id,
        createdBy: user?.user_metadata.full_name,
      });

      if (logError) throw logError;

      // Step 4: Update selected installment (if applicable)
      if (installment) {
        const newPaidAmount = Number(
          (Number(installment.paidAmount || 0) + amount).toFixed(2),
        );
        const isPaid = newPaidAmount >= Number(installment.amount);
        const status = isPaid ? "Paid" : "Partially Paid";
        const paidOn = isPaid ? new Date().toISOString() : null;

        const { error: instUpdateError } = await supabase
          .from("PaymentInstallments")
          .update({
            paidAmount: newPaidAmount,
            status,
            paidOn,
          })
          .eq("id", installment.id);

        if (instUpdateError) throw instUpdateError;
      }

      // Step 5: Update parent payment totals & calculate next due date
      const newPaidAmount = Number(
        (Number(payment.payedAmount || 0) + amount).toFixed(2),
      );
      const remaining = Number(
        (Number(payment.totalCost) - newPaidAmount).toFixed(2),
      );

      let status = "Pending";
      if (remaining <= 0) {
        status = "Paid";
      } else if (newPaidAmount > 0) {
        status = "Partially Paid";
      }

      // Fetch unpaid installments to calculate next due date
      const { data: unpaidInsts } = await supabase
        .from("PaymentInstallments")
        .select("dueDate")
        .eq("paymentId", id)
        .neq("status", "Paid")
        .order("installmentNo");

      let nextDueDate = null;
      if (unpaidInsts && unpaidInsts.length > 0) {
        nextDueDate = unpaidInsts[0].dueDate;
      }

      const { error: paymentError } = await supabase
        .from("Payments")
        .update({
          payedAmount: newPaidAmount,
          remainingAmount: remaining,
          paymentStatus: status,
          nextDueDate,
          updatedAt: new Date(),
        })
        .eq("id", id);

      if (paymentError) throw paymentError;

      alert("Payment received successfully");
      router.push(`/payments/${id}/receipt/${receipt.id}`);
    } catch (err) {
      console.log(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleInstallmentChange = (e) => {
    const installmentId = e.target.value;

    setSelectedInstallment(installmentId);

    const selected = installments.find(
      (inst) => String(inst.id) === installmentId,
    );

    const remaining = selected.amount - (selected.paidAmount || 0);

    setForm((prev) => ({
      ...prev,
      notes: selected ? `EMI #${selected.installmentNo}` : "",
      amount: selected ? `${remaining.toFixed(2)}` : "",
    }));
  };

  if (!payment) {
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

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 m-10 mt-20 p-8 max-w-5xl mx-auto">
        <div className="border-b dark:border-slate-800 pb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-500">
              Receive Payment
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Record incoming payment transaction, update installment schedule,
              and issue a receipt.
            </p>
          </div>

          <div className="text-right">
            <div>
              <span className="text-slate-500 dark:text-slate-400 text-sm">
                Receipt No:
              </span>
              <span className="ml-3 font-bold text-slate-800 dark:text-white">
                {receiptNo}
              </span>
            </div>

            <div className="mt-1">
              <span className="text-slate-500 dark:text-slate-400 text-sm">
                Date:
              </span>
              <span className="ml-3 text-slate-800 dark:text-white">
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  CIN
                </label>
                <input
                  value={payment.CIN}
                  disabled
                  className="w-full border dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Payment Method
                </label>
                <select
                  className="w-full border dark:border-slate-700 rounded-xl p-3 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={form.method}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      method: e.target.value,
                    })
                  }
                >
                  <option>Cash</option>
                  <option>UPI</option>
                  <option>Cheque</option>
                  <option>Card</option>
                  <option>Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Reference No / Transaction ID
                </label>
                <input
                  className="w-full border dark:border-slate-700 rounded-xl p-3 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. UPI Ref, Cheque No"
                  value={form.referenceNo}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      referenceNo: e.target.value,
                    })
                  }
                />
              </div>

              {payment.type === "Installment" && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Installment (Select EMI to pay) *
                  </label>
                  <select
                    className="w-full border dark:border-slate-700 rounded-xl p-3 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={selectedInstallment}
                    onChange={handleInstallmentChange}
                  >
                    <option value="select EMI">Select EMI</option>
                    {installments.map((inst) => {
                      const remaining = inst.amount - (inst.paidAmount || 0);
                      return (
                        <option key={inst.id} value={inst.id}>
                          EMI #{inst.installmentNo} - ₹{inst.amount} (Remaining:
                          ₹{remaining.toFixed(2)})
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Notes
                </label>
                <textarea
                  rows={3}
                  className="w-full border dark:border-slate-700 rounded-xl p-3 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={form.notes}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      notes: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Right */}
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="border dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Total Cost
                  </p>
                  <p className="font-bold text-lg text-slate-800 dark:text-white mt-1">
                    ₹{payment.totalCost}
                  </p>
                </div>

                <div className="border dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Paid Amount
                  </p>
                  <p className="font-bold text-lg text-green-600 dark:text-green-400 mt-1">
                    ₹{payment.payedAmount || 0}
                  </p>
                </div>

                <div className="border dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Remaining
                  </p>
                  <p className="font-bold text-lg text-red-600 dark:text-red-400 mt-1">
                    ₹{payment.remainingAmount}
                  </p>
                </div>
              </div>

              <div className="border dark:border-slate-800 rounded-2xl p-6 bg-blue-50/10 dark:bg-slate-800/20">
                <label className="block text-md font-bold text-slate-800 dark:text-white mb-3">
                  Received Amount (₹)
                </label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      amount: e.target.value,
                    })
                  }
                  placeholder="0.00"
                  className="w-full border dark:border-slate-700 rounded-xl p-4 text-2xl font-bold dark:bg-slate-850 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 border-t dark:border-slate-800 pt-6 flex justify-end gap-3">
            <button
              onClick={() => router.push(`/payments/${id}`)}
              className="px-6 py-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition font-semibold text-sm"
            >
              Cancel
            </button>
            <button
              onClick={receivePayment}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-3.5 rounded-xl shadow-lg shadow-blue-500/20 hover:scale-[1.01] active:scale-[0.99] transition duration-150 disabled:opacity-50 text-sm"
            >
              {loading ? "Saving..." : "Save Payment & Issue Receipt"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
