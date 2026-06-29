"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar/page";

export default function ReceiptPage() {
  const { receiptId } = useParams();
  const router = useRouter();

  const [receipt, setReceipt] = useState(null);
  const [payment, setPayment] = useState(null);
  const [transaction, setTransaction] = useState(null);
  const [client, setClient] = useState(null);

  useEffect(() => {
    fetchReceipt();
  }, []);

  async function fetchReceipt() {
    const { data: receiptData, error } = await supabase
      .from("Receipts")
      .select("*")
      .eq("id", receiptId)
      .single();

    if (error) {
      console.log(error);
      return;
    }

    setReceipt(receiptData);

    const { data: paymentData } = await supabase
      .from("Payments")
      .select("*")
      .eq("id", receiptData.paymentId)
      .single();

    setPayment(paymentData);

    const { data: transactionData } = await supabase
      .from("PaymentTransactions")
      .select("*")
      .eq("id", receiptData.transactionId)
      .single();

    setTransaction(transactionData);

    const { data: clientData } = await supabase
      .from("Clients")
      .select("*")
      .eq("CIN", paymentData.CIN)
      .single();

    setClient(clientData);
  }

  if (!receipt || !payment || !transaction || !client) {
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
              Fetching Detials....
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* <Navbar /> */}

      <div className="max-w-4xl mx-auto p-6">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-white rounded-xl shadow text-xs sm:text-sm font-medium mb-8 dark:text-gray-700"
        >
          ← Back
        </button>
        <div
          id="receipt"
          className="bg-white border rounded-xl p-8 shadow dark:text-gray-700"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold">FINIX SOLAR</h1>

            <p className="text-gray-500">PAYMENT RECEIPT</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <strong>Receipt No:</strong>
              <br />
              {receipt.receiptNumber}
            </div>

            <div>
              <strong>Date:</strong>
              <br />
              {new Date(receipt.createdAt).toLocaleDateString()}
            </div>

            <div>
              <strong>CIN:</strong>
              <br />
              {client.CIN}
            </div>

            <div>
              <strong>Consumer:</strong>
              <br />
              {client.consumerName}
            </div>

            <div>
              <strong>Contact Person:</strong>
              <br />
              {client.contactPersonName}
            </div>

            <div>
              <strong>Location:</strong>
              <br />
              {client.location}
            </div>
          </div>

          <hr className="my-6" />

          <div className="space-y-3">
            <div>
              <strong>Amount Received:</strong> ₹{transaction.amount}
            </div>

            <div>
              <strong>Payment Type:</strong> {transaction.paymenttype}
            </div>

            <div>
              <strong>Method:</strong> {transaction.method}
            </div>

            <div>
              <strong>Reference No:</strong> {transaction.referenceNo || "-"}
            </div>

            <div>
              <strong>Loan Provider:</strong> {transaction.loanprovider || "-"}
            </div>

            <div>
              <strong>Notes:</strong> {transaction.notes || "-"}
            </div>
          </div>

          <hr className="my-6" />

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <strong>Total Cost</strong>
              <br />₹{payment.totalCost}
            </div>

            <div>
              <strong>Paid Amount</strong>
              <br />₹{payment.payedAmount}
            </div>

            <div>
              <strong>Remaining</strong>
              <br />₹{payment.remainingAmount}
            </div>
          </div>

          <div className="mt-12 text-right">
            <p className="font-semibold">Authorized Signature</p>

            <br />
            <br />

            <p>FINIX SOLAR</p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => window.print()}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Print Receipt
          </button>
        </div>
      </div>
    </>
  );
}
