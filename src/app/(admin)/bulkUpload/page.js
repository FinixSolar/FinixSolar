"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar/page";
import * as XLSX from "xlsx";
import { supabase } from "@/lib/supabase";

const BulkUpload = () => {
  const [tableName, setTableName] = useState("");
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [stats, setStats] = useState({ total: 0, processed: 0 });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setSuccess(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target.result, {
          type: "binary",
          cellDates: true,
        });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          raw: false,
        });

        if (jsonData.length === 0) {
          setError("The Excel file is empty.");
        } else {
          setData(jsonData);
          setStats({ total: jsonData.length, processed: 0 });
        }
      } catch (err) {
        setError(
          "Failed to parse Excel file. Please ensure it's a valid format.",
        );
        console.log(err);
      }
    };
    reader.readAsBinaryString(selectedFile);
  };

  function excelDateToJSDate(serial) {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);

    return date_info.toISOString().split("T")[0];
  }

  const processedData = data.map((row) => {
    const newRow = { ...row };

    Object.keys(newRow).forEach((key) => {
      if (typeof newRow[key] === "number" && newRow[key] > 30000) {
        try {
          newRow[key] = excelDateToJSDate(newRow[key]);
        } catch (err) {}
      }
    });

    return newRow;
  });

  const mapPIDRow = (row) => ({
    CIN: row["CIN"],

    date: row["Date"],

    consumerName: row["Consumer Name"],
    consumerNumber: row["Consumer No."],

    address: row["Consumer Address"],

    mobileNo: row["Mobile No."],

    paymentType: row["Payment Type"],

    payedAmount: row["payedAmount"],

    remainingAmount: row["remainingAmount"],

    paymentStatus: row["paymentStatus"],

    installmentCount: row["installmentCount"],

    nextDueDate: row["nextDueDate"],

    email: row["Email"],

    RTSCapacity: row["RTS Capacity"],

    quotationAmount: row["Quote Amt."],

    billingUnit: row["Billing Unit"],

    pvmMake: row["PVM Make"],
    pvmWattage: row["PVM Wp"],
    pvmQuantity: row["No. of PVM"],
    pvmSerialNumber: row["PVM SN"],

    gtiMake: row["GT Inv. Make"],
    gtiCapacity: row["GT Inv. Cap."],
    gtiSerialNumber: row["Inverter SN"],

    gnMake: row["Gen. Meter Make"],
    gnSerialNumber: row["Gen. Meter SN"],

    netMake: row["Net Meter Make"],
    netSerialNumber: row["Net Meter SN"],

    commissioningDate: row["Commissioning Date"],

    totalCost: row["Deal Amt."],
  });

  const uploadPID = async (rows) => {
    let processedCount = 0;

    for (const rawRow of rows) {
      const row = mapPIDRow(rawRow);

      const cin = row.CIN?.toString().trim();

      if (!cin) {
        throw new Error("CIN is required");
      }

      // ==========================
      // CLIENT
      // ==========================

      const { data: client, error: clientError } = await supabase
        .from("Clients")
        .upsert(
          {
            CIN: cin,

            date: row.date,

            consumerName: row.consumerName,

            consumerNumber: row.consumerNumber,

            address: row.address,

            subsidyMobile: row.mobileNo,

            subsidyEmail: row.email,

            paymentType: row.paymentType,
          },
          {
            onConflict: "CIN",
          },
        )
        .select()
        .single();

      if (clientError) throw clientError;

      // ==========================
      // PVM
      // ==========================

      const { data: pvm, error: pvmError } = await supabase
        .from("PVM")
        .insert({
          CIN: cin,

          make: row.pvmMake,

          wattage: row.pvmWattage,

          quantity: row.pvmQuantity,

          serialNumber: row.pvmSerialNumber,

          clientId: client.id,
        })
        .select()
        .single();

      if (pvmError) throw pvmError;

      // ==========================
      // GTI
      // ==========================

      const { data: gti, error: gtiError } = await supabase
        .from("GTI")
        .insert({
          CIN: cin,

          make: row.gtiMake,

          capacity: row.gtiCapacity,

          serialNumber: row.gtiSerialNumber,

          clientId: client.id,
        })
        .select()
        .single();

      if (gtiError) throw gtiError;

      // ==========================
      // METER
      // ==========================

      const { data: meter, error: meterError } = await supabase
        .from("meter")
        .insert({
          CIN: cin,

          GnMake: row.gnMake,

          GnSerialNumber: row.gnSerialNumber,

          netMake: row.netMake,

          netSerialNumber: row.netSerialNumber,

          clientId: client.id,
        })
        .select()
        .single();

      if (meterError) throw meterError;

      // ==========================
      // PAYMENT
      // ==========================

      // Helper function to safely parse currency strings OR numbers
      const parseCurrency = (val) => {
        if (val === undefined || val === null || val === "") return 0;
        if (typeof val === "number") return val;

        // Convert to string first in case it's an unexpected type, then replace
        return Number(val.toString().replace(/[₹,]/g, ""));
      };

      const parsedTotalCost = parseCurrency(row.totalCost);
      const parsedQuotationAmount = parseCurrency(row.quotationAmount);
      const parsedPayedAmount = parseCurrency(row.payedAmount);

      // Calculate remaining amount safely
      const calculatedRemaining =
        row.remainingAmount !== undefined
          ? parseCurrency(row.remainingAmount)
          : parsedTotalCost - parsedPayedAmount;

      // Calculate status based on the exact parsed value
      const calculatedStatus =
        calculatedRemaining <= 0 ? "Paid" : "Partially Paid";

      const { data: payment, error: paymentError } = await supabase
        .from("Payments")
        .insert({
          clientId: client.id,
          CIN: cin,
          type: row.paymentType,
          totalCost: parsedTotalCost,
          quotationAmount: parsedQuotationAmount,
          payedAmount: parsedPayedAmount,
          remainingAmount: calculatedRemaining,
          paymentStatus: calculatedStatus, // Pass the evaluated string!
          installmentCount: row.installmentCount
            ? Number(row.installmentCount)
            : 0,
          nextDueDate: row.nextDueDate ? row.nextDueDate : null,
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // ==========================
      // FILES
      // ==========================

      const { data: fileRecord, error: fileError } = await supabase
        .from("files")
        .insert({
          CIN: cin,
        })
        .select()
        .single();

      if (fileError) throw fileError;

      // ==========================
      // INSTALLATION
      // ==========================

      const { error: installationError } = await supabase
        .from("Installations")
        .insert({
          CIN: cin,

          RTSCapacity: Number(row.RTSCapacity ? row.RTSCapacity : 0),

          billingUnit: Number(row.billingUnit ? row.billingUnit : 0),

          commissioningDate: row.commissioningDate,

          PVMId: pvm.id,

          GTIId: gti.id,

          meterId: meter.id,

          paymentId: payment.id,

          fileId: fileRecord.id,

          clientId: client.id,
        });

      if (installationError) throw installationError;

      processedCount++;

      setStats((prev) => ({
        ...prev,
        processed: processedCount,
      }));
    }
  };

  const handleUpload = async () => {
    if (!tableName.trim()) {
      setError("Please enter a table name.");
      return;
    }
    if (data.length === 0) {
      setError("Please select a valid Excel file first.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (tableName.trim().toUpperCase() === "PID") {
        await uploadPID(processedData);

        setSuccess(`Successfully uploaded ${processedData.length} PID records`);
        setLoading(false);

        return;
      }

      // Bulk insert in chunks to avoid timeout or payload limit issues
      const chunkSize = 500;
      let processedCount = 0;

      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = processedData.slice(i, i + chunkSize);
        const { error: insertError } = await supabase
          .from(tableName.trim())
          .insert(chunk);

        if (insertError) throw insertError;

        processedCount += chunk.length;
        setStats((prev) => ({ ...prev, processed: processedCount }));
      }

      setSuccess(
        `Successfully uploaded ${data.length} records to '${tableName}'.`,
      );
      setFile(null);
      setData([]);
      setTableName("");
    } catch (err) {
      console.log("FULL ERROR:", err);
      console.log("ERROR TYPE:", typeof err);
      console.log("ERROR KEYS:", Object.keys(err || {}));

      setError(err?.message || JSON.stringify(err) || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white font-sans">
      <Navbar />

      <main className="max-w-4xl mx-auto pt-32 pb-16 px-6">
        <div className="flex flex-col items-center mb-12">
          <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/30">
            <i className="fas fa-file-excel text-3xl text-blue-400"></i>
          </div>
          <h1 className="text-4xl font-bold tracking-tight bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Bulk Data Upload
          </h1>
          <p className="text-gray-400 mt-2 text-center max-w-md">
            Efficiently import your Excel data into Supabase tables with a few
            clicks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
              <label className="block text-sm font-medium text-gray-400 mb-2 px-1">
                Type of DATA
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fas fa-table text-gray-500 group-focus-within:text-blue-400 transition-colors"></i>
                </div>
                <input
                  type="text"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-900/50 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none text-white placeholder-gray-600"
                  placeholder="e.g. Clients"
                />
              </div>
            </div>

            <div className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden group">
              <label className="block text-sm font-medium text-gray-400 mb-4 px-1">
                Upload Stylesheet
              </label>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div
                  className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all ${file ? "border-blue-500 bg-blue-500/5" : "border-white/10 hover:border-white/30 hover:bg-white/5"}`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${file ? "bg-blue-500 text-white" : "bg-white/5 text-gray-400"}`}
                  >
                    <i
                      className={`fas ${file ? "fa-check" : "fa-cloud-upload-alt"} text-xl`}
                    ></i>
                  </div>
                  <span className="text-sm font-medium text-gray-300">
                    {file ? file.name : "Choose Excel file"}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    XLSX, XLS or CSV files only
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Status & Action Section */}
          <div className="flex flex-col h-full">
            <div className="flex-1 p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-6 flex items-center">
                  <i className="fas fa-info-circle mr-3 text-blue-400"></i>
                  Upload Status
                </h3>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-start animate-fade-in">
                    <i className="fas fa-exclamation-circle mt-1 mr-3"></i>
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-sm flex items-start animate-fade-in">
                    <i className="fas fa-check-circle mt-1 mr-3"></i>
                    <span>{success}</span>
                  </div>
                )}

                {!error && !success && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Records detected:</span>
                      <span className="text-white font-mono">
                        {data.length}
                      </span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full transition-all duration-500 ease-out"
                        style={{
                          width: `${data.length > 0 ? (stats.processed / stats.total) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                    {loading && (
                      <p className="text-xs text-gray-500 animate-pulse">
                        Processing: {stats.processed} / {stats.total} records...
                      </p>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={handleUpload}
                disabled={loading || !file || !tableName}
                className={`w-full py-4 rounded-2xl font-bold text-sm tracking-widest uppercase transition-all flex items-center justify-center space-x-2 mt-8 ${
                  loading || !file || !tableName
                    ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-50 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] active:scale-95 text-white"
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-rocket"></i>
                    <span>Start Import</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 p-6 rounded-3xl bg-blue-600/5 border border-blue-500/10">
          <h4 className="text-sm font-semibold text-blue-400 mb-3 flex items-center">
            <i className="fas fa-lightbulb mr-2"></i> Quick Tips
          </h4>
          <ul className="text-sm text-gray-500 space-y-2 list-disc pl-5">
            <li>
              Ensure the Excel column headers match the Supabase table column
              names exactly.
            </li>
            <li>
              Format dates as <code className="text-blue-300">YYYY-MM-DD</code>{" "}
              for consistency.
            </li>
            <li>
              Avoid empty rows at the end of your sheet for cleaner imports.
            </li>
          </ul>
        </div>
      </main>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default BulkUpload;
