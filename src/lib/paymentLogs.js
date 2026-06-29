import { supabase } from "./supabase";

export async function createPaymentLog({
  paymentId,
  action,
  description,
  amount = null,
  transactionId = null,
  receiptId = null,
  createdBy = null,
}) {
  const { error } = await supabase.from("PaymentLogs").insert({
    paymentId,
    action,
    description,
    amount,
    transactionId,
    receiptId,
    createdBy,
  });

  if (error) {
    console.log("Payment Log Error:", error);
  }
}
