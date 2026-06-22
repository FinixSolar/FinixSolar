"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar/page";

export default function ClientDetailsPage() {
  const router = useRouter();
  const { cin } = useParams();

  const [loading, setLoading] = useState(true);

  const [client, setClient] = useState(null);
  const [installation, setInstallation] = useState(null);
  const [payment, setPayment] = useState(null);
  const [pvms, setPvms] = useState([]);
  const [gtis, setGtis] = useState([]);
  const [meter, setMeter] = useState(null);
  const [fileStatus, setFileStatus] = useState(null);

  useEffect(() => {
    fetchData();
  }, [cin]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Client
      const { data: clientData } = await supabase
        .from("Clients")
        .select("*")
        .eq("CIN", cin)
        .single();

      setClient(clientData);

      // Installation
      const { data: installationData } = await supabase
        .from("Installations")
        .select("*")
        .eq("CIN", cin)
        .single();

      setInstallation(installationData);

      // Payment
      const { data: paymentData } = await supabase
        .from("Payments")
        .select("*")
        .eq("CIN", cin)
        .single();

      setPayment(paymentData);

      // PVM
      const { data: pvmData } = await supabase
        .from("PVM")
        .select("*")
        .eq("CIN", cin)
        .single();

      setPvms(pvmData || []);

      // GTI
      const { data: gtiData } = await supabase
        .from("GTI")
        .select("*")
        .eq("CIN", cin)
        .single();

      setGtis(gtiData || []);

      // Files
      const { data: fileData } = await supabase
        .from("files")
        .select("*")
        .eq("CIN", cin)
        .single();

      setFileStatus(fileData);

      // Meter
      if (installationData?.meterId) {
        const { data: meterData } = await supabase
          .from("meter")
          .select("*")
          .eq("id", installationData.meterId)
          .single();

        setMeter(meterData);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const TableRow = ({ label, value }) => (
    <tr className="border-b">
      <td className="font-medium p-3 w-1/3 bg-gray-50">{label}</td>
      <td className="p-3">{value || "-"}</td>
    </tr>
  );

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Loading...</h1>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold text-red-600">Client Not Found</h1>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <Navbar />
      <main className="max-w-7xl mx-auto pt-24 px-6 pb-10 space-y-6">
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-white rounded-xl shadow text-sm font-medium"
          >
            ← Back
          </button>

          <h1 className="text-3xl font-bold">Client Details</h1>

          <div></div>
        </div>

        {/* Client Details */}
        <div className="bg-white rounded-3xl shadow p-6">
          <h2 className="text-gray-700 text-2xl font-bold">
            {client.consumerName}
          </h2>

          <p className="text-slate-500 mt-1 font-bold">CIN : {client.CIN}</p>

          <div className="grid md:grid-cols-4 gap-4 mt-6">
            <div>
              <p className="text-xs text-slate-600">Consumer No</p>

              <p className="font-semibold text-gray-600">
                {client.consumerNumber}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Contact</p>

              <p className="font-semibold text-gray-600">
                {client.contactPersonNumber}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Email</p>

              <p className="font-semibold text-gray-600">
                {client.subsidyEmail}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Location</p>

              <p className="font-semibold text-gray-600">{client.location}</p>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-xs text-slate-500">Qoutation Amount</p>

            <h3 className="text-gray-700    text-2xl font-bold text-yellow-500">
              ₹{payment?.quotationAmount || 0}
            </h3>
          </div>

          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-xs text-slate-500">Total Cost</p>

            <h3 className="text-gray-700    text-2xl font-bold">
              ₹{payment?.totalCost || 0}
            </h3>
          </div>

          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-xs text-slate-500">Paid</p>

            <h3 className="text-gray-700    text-2xl font-bold text-green-600">
              ₹{payment?.payedAmount || 0}
            </h3>
          </div>

          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-xs text-slate-500">Remaining</p>

            <h3 className="text-gray-700    text-2xl font-bold text-red-600">
              ₹{payment?.remainingAmount || 0}
            </h3>
          </div>
        </div>

        {/* INSTALLATION */}
        <section className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-gray-700 text-xl font-bold mb-5">
            Installation Details
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="border rounded-xl p-5">
              <p className="text-sm text-slate-500">RTS Capacity</p>

              <h3 className="text-gray-700    text-2xl font-bold">
                {installation?.RTSCapacity} KW
              </h3>
            </div>

            <div className="border rounded-xl p-5">
              <p className="text-sm text-slate-500">Billing Unit</p>

              <h3 className="text-gray-700    text-2xl font-bold">
                {installation?.billingUnit}
              </h3>
            </div>

            <div className="border rounded-xl p-5">
              <p className="text-sm text-slate-500">Commissioning Date</p>

              <h3 className="text-gray-700    text-lg font-bold">
                {installation?.commissioningDate}
              </h3>
            </div>
          </div>
        </section>

        {/* PVM */}
        <section className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-gray-700 text-xl font-bold mb-5">
            Solar Panels (PVM)
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="border rounded-xl p-5">
              <p className="text-sm text-slate-500">PVM Make</p>

              <h3 className="text-gray-700    text-2xl font-bold">
                {pvms?.make}{" "}
              </h3>
            </div>

            <div className="border rounded-xl p-5">
              <p className="text-sm text-slate-500">Wattage</p>

              <h3 className="text-gray-700    text-2xl font-bold">
                {pvms?.wattage} WP
              </h3>
            </div>

            <div className="border rounded-xl p-5">
              <p className="text-sm text-slate-500">Quantity</p>

              <h3 className="text-gray-700    text-lg font-bold">
                {pvms?.quantity}
              </h3>
            </div>
            <div className="border rounded-xl p-5">
              <p className="text-sm text-slate-500">Serial Number</p>

              <h3 className="text-gray-700    text-lg font-bold">
                {pvms?.serialNumber}
              </h3>
            </div>
          </div>
        </section>

        {/* GTI */}
        <section className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-gray-700 text-xl font-bold mb-5">
            {" "}
            Inverters (GTI)
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="border rounded-xl p-5">
              <p className="text-sm text-slate-500">GTI Make</p>

              <h3 className="text-gray-700    text-2xl font-bold">
                {gtis?.make}{" "}
              </h3>
            </div>

            <div className="border rounded-xl p-5">
              <p className="text-sm text-slate-500">Capacity</p>

              <h3 className="text-gray-700    text-2xl font-bold">
                {gtis?.capacity}
              </h3>
            </div>
            <div className="border rounded-xl p-5">
              <p className="text-sm text-slate-500">Serial Number</p>

              <h3 className="text-gray-700    text-lg font-bold">
                {gtis?.serialNumber}
              </h3>
            </div>
          </div>
        </section>

        {/* METER */}
        <section className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-gray-700    font-bold text-lg mb-4">
              Generation Meter
            </h3>

            <p className="text-gray-700">Make : {meter?.GnMake || "-"}</p>

            <p className="text-gray-700">
              Serial : {meter?.GnSerialNumber || "-"}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-gray-700    font-bold text-lg mb-4">
              Net Meter
            </h3>

            <p className="text-gray-700">Make : {meter?.netMake || "-"}</p>

            <p className="text-gray-700">
              Serial : {meter?.netSerialNumber || "-"}
            </p>
          </div>
        </section>

        {/* FILE STATUS */}
        <section className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-gray-700    font-bold text-xl mb-5">
            File Status
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-slate-500">File Issued</p>

              <p className="font-semibold text-gray-600">
                {fileStatus?.fileIssued || "Pending"}
              </p>
            </div>

            <div>
              <p className="text-slate-500">Document Pending</p>

              <p className="font-semibold text-gray-600">
                {fileStatus?.documentPending || "None"}
              </p>
            </div>

            <div>
              <p className="text-slate-500">Hand Over</p>

              <p className="font-semibold text-gray-600">
                {fileStatus?.handOver || "-"}
              </p>
            </div>

            <div>
              <p className="text-slate-500">Handed To</p>

              <p className="font-semibold text-gray-600">
                {fileStatus?.handedTo || "-"}
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
