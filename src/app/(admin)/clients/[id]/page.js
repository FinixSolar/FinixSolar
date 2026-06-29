"use client";

import { useAuth } from "@/components/AuthProvider";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar/page";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ClientDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [role, setRole] = useState("viewer");

  const [client, setClient] = useState(null);
  const [pvm, setPvm] = useState([]);
  const [gti, setGti] = useState([]);
  const [meter, setMeter] = useState([]);
  const [installations, setInstallations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [files, setFiles] = useState([]);

  const [saveAll, setSaveAll] = useState({
    pvm: false,
    gti: false,
    meter: false,
    payment: false,
    installation: false,
    file: false,
  });

  const [pvmForm, setPvmForm] = useState({
    make: "",
    wattage: "",
    quantity: "",
    serialNumber: "",
  });

  const [gtiForm, setGtiForm] = useState({
    make: "",
    capacity: "",
    serialNumber: "",
  });

  const [meterForm, setMeterForm] = useState({
    GnMake: "",
    GnSerialNumber: "",
    netMake: "",
    netSerialNumber: "",
  });

  const [installationForm, setInstallationForm] = useState({
    RTSCapacity: 0.0,
    billingUnit: 0,
    commissioningDate: new Date().toLocaleDateString(),
    isCompleted: null,
  });

  // const [paymentForm, setPaymentForm] = useState({
  //   type: "",
  //   totalCost: "",
  //   payedAmount: "",
  //   remainingAmount: "",
  //   quotationAmount: "",
  // });

  const [fileForm, setFileForm] = useState({
    fileIssued: "",
    documentPending: "",
    handOver: "",
    handedTo: "",
    givenBy: "",
  });

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
    if (id) {
      fetchClientData();
    }
  }, [id]);

  // useEffect(() => {
  //   const total = Number(paymentForm.totalCost) || 0;
  //   const paid = Number(paymentForm.payedAmount) || 0;

  //   setPaymentForm((prev) => ({
  //     ...prev,
  //     remainingAmount: Math.max(total - paid, 0),
  //   }));
  // }, [paymentForm.totalCost, paymentForm.payedAmount]);

  const fetchClientData = async () => {
    try {
      setLoading(true);

      // Client
      const { data: clientData, error: clientError } = await supabase
        .from("Clients")
        .select("*")
        .eq("id", id)
        .single();

      if (clientError) throw clientError;

      setClient(clientData);

      // PVM
      const { data: pvmData } = await supabase
        .from("PVM")
        .select("*")
        .eq("clientId", id);

      setPvm(pvmData || []);
      if (pvmData?.length > 0) {
        setPvmForm({
          make: pvmData[0].make || "",
          wattage: pvmData[0].wattage || 0,
          quantity: pvmData[0].quantity || "",
          serialNumber: pvmData[0].serialNumber || "",
        });
      }

      // GTI
      const { data: gtiData } = await supabase
        .from("GTI")
        .select("*")
        .eq("clientId", id);

      setGti(gtiData || []);
      if (gtiData?.length > 0) {
        setGtiForm({
          make: gtiData[0].make || "",
          capacity: gtiData[0].capacity || "",
          serialNumber: gtiData[0].serialNumber || "",
        });
      }

      // Meter
      const { data: meterData } = await supabase
        .from("meter")
        .select("*")
        .eq("clientId", id);

      setMeter(meterData || []);
      if (meterData?.length > 0) {
        setMeterForm({
          GnMake: meterData[0].GnMake || "",
          GnSerialNumber: meterData[0].GnSerialNumber || "",
          netMake: meterData[0].netMake || "",
          netSerialNumber: meterData[0].netSerialNumber || "",
        });
      }

      // Installations
      const { data: installationData } = await supabase
        .from("Installations")
        .select("*")
        .eq("clientId", id);

      setInstallations(installationData || []);
      if (installationData?.length > 0) {
        setInstallationForm({
          RTSCapacity: installationData[0].RTSCapacity || "",
          billingUnit: installationData[0].billingUnit || "",
          commissioningDate: installationData[0].commissioningDate || "",
          isCompleted: installationData[0].isCompleted,
        });
      }

      // Payments
      const { data: paymentData } = await supabase
        .from("Payments")
        .select("*")
        .eq("clientId", id);

      setPayments(paymentData || []);
      // if (paymentData?.length > 0) {
      //   setPaymentForm({
      //     type: paymentData[0].type || "",
      //     totalCost: paymentData[0].totalCost || "",
      //     payedAmount: paymentData[0].payedAmount || "",
      //     remainingAmount: paymentData[0].remainingAmount || "",
      //     quotationAmount: paymentData[0].quotationAmount || "",
      //   });
      // }

      // Files
      const { data: fileData } = await supabase
        .from("files")
        .select("*")
        .eq("clientId", id);

      setFiles(fileData || []);
      if (fileData?.length > 0) {
        setFileForm({
          fileIssued: fileData[0].fileIssued || "",
          documentPending: fileData[0].documentPending || "",
          handOver: fileData[0].handOver || "",
          handedTo: fileData[0].handedTo || "",
          givenBy: fileData[0].givenBy || "",
        });
      }
    } catch (error) {
      // console.log(error);
      console.log("installion error", result.error);
    } finally {
      setLoading(false);
    }
  };

  const createNotification = async ({
    title,
    message,
    type,
    relatedTable,
    relatedRecordId,
  }) => {
    await supabase.from("notifications").insert({
      title,
      message,
      type,
      recipient_id: user.id,
      created_by: user.id,
      creator_name: user.user_metadata?.full_name,
      related_table: relatedTable,
      related_record_id: relatedRecordId,
    });
  };
  const logAudit = async ({ action, tableName, recordId, details }) => {
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      user_name: user.user_metadata?.full_name,
      action,
      table_name: tableName,
      record_id: recordId,
      details,
    });
  };

  const savePVM = async () => {
    try {
      let result;

      if (pvm.length > 0) {
        result = await supabase
          .from("PVM")
          .update({
            ...pvmForm,
          })
          .eq("clientId", id);
      } else {
        result = await supabase.from("PVM").insert([
          {
            clientId: client.id,
            CIN: client.CIN,
            ...pvmForm,
          },
        ]);
      }

      if (result.error) {
        console.log(result.error);
        return;
      }

      setSaveAll((prev) => ({ ...prev, pvm: true }));
      fetchClientData();
    } catch (error) {
      console.log(error);
    }
  };
  const saveGTI = async () => {
    try {
      let result;

      if (gti.length > 0) {
        result = await supabase
          .from("GTI")
          .update({
            ...gtiForm,
          })
          .eq("clientId", id);
      } else {
        result = await supabase.from("GTI").insert([
          {
            clientId: client.id,
            CIN: client.CIN,
            ...gtiForm,
          },
        ]);
      }

      if (result.error) {
        console.log(result.error);
        return;
      }

      setSaveAll((prev) => ({ ...prev, gti: true }));
      fetchClientData();
    } catch (error) {
      console.log(error);
    }
  };
  const saveMeter = async () => {
    try {
      let result;

      if (meter.length > 0) {
        result = await supabase
          .from("meter")
          .update({
            ...meterForm,
          })
          .eq("clientId", id);
      } else {
        result = await supabase.from("meter").insert([
          {
            clientId: client.id,
            CIN: client.CIN,
            ...meterForm,
          },
        ]);
      }

      if (result.error) {
        console.log(result.error);
        return;
      }

      setSaveAll((prev) => ({ ...prev, meter: true }));
      fetchClientData();
    } catch (error) {
      console.log(error);
    }
  };

  // const savePayment = async () => {
  //   console.log(payments);
  //   let paymentId = "";
  //   if (payments.length > 0) {
  //     const { data, error } = await supabase
  //       .from("Payments")
  //       .update({
  //         clientId: client.id,
  //         CIN: client.CIN,
  //         type: paymentForm.type,
  //         totalCost: Number(paymentForm.totalCost),
  //         payedAmount: Number(paymentForm.payedAmount),
  //         remainingAmount: Number(paymentForm.remainingAmount),
  //         quotationAmount: Number(paymentForm.quotationAmount),
  //       })
  //       .eq("clientId", id);
  //     console.log(data, error);
  //     // let payementStatus =
  //     // if (remainingAmount == 0 || remainingAmount == "" || remainingAmount == null || remainingAmount == undefined) {

  //     // }
  //     // paymentId = Updatedpayment[0].id;
  //     toast.success("Payment Updated");
  //     if (
  //       Number(paymentForm.remainingAmount) === 0 &&
  //       Number(payments[0]?.remainingAmount) > 0
  //     ) {
  //       await createNotification({
  //         title: "Payment Completed",
  //         message: `${client.consumerName} payment completed`,
  //         type: "payment",
  //         relatedTable: "Payments",
  //         relatedRecordId: client.id,
  //       });
  //     }
  //     await logAudit({
  //       action: "UPDATE",
  //       tableName: "Payments",
  //       recordId: client.id,
  //       details: {
  //         client: client.consumerName,
  //         remainingAmount: paymentForm.remainingAmount,
  //         payedAmount: paymentForm.payedAmount,
  //       },
  //     });
  //     // await supabase.from("notifications").insert([
  //     //   {
  //     //     title: "Payment Updated",
  //     //     message: `Payment updated for CIN ${client.CIN}`,
  //     //     type: "payment",
  //     //     recipient_id: user.id,
  //     //     created_by: user.id,
  //     //     creator_name: user.user_metadata?.full_name,
  //     //   },
  //     // ]);
  //     // await supabase.from("notifications").insert({
  //     //   title: "Client Added",
  //     //   message: `${consumerName} added`,
  //     //   recipient_id: targetUserId,
  //     //   created_by: user.id,
  //     //   creator_name: user.user_metadata?.full_name,
  //     //   type: "client",
  //     // });
  //     toast.success("Payment Updated");
  //   } else {
  //     const { data, error } = await supabase
  //       .from("Payments")
  //       .insert([
  //         {
  //           clientId: client.id,
  //           CIN: client.CIN,
  //           ...paymentForm,
  //         },
  //       ])
  //       .select();
  //     console.log("Form", paymentForm);
  //     console.log("DATA:", data);
  //     console.log("ERROR:", error);
  //     // paymentId = data[0].id;
  //     if (
  //       Number(paymentForm.remainingAmount) === 0 &&
  //       Number(payments[0]?.remainingAmount) > 0
  //     ) {
  //       await createNotification({
  //         title: "Payment Completed",
  //         message: `${client.consumerName} payment completed`,
  //         type: "payment",
  //         relatedTable: "Payments",
  //         relatedRecordId: client.id,
  //       });
  //     }
  //   }

  //   // if (error) {
  //   //   alert(error.message);
  //   //   return;
  //   // }

  //   setSaveAll({ ...saveAll, payment: true });
  //   setTimeout(() => {
  //     // router.push(`/payments/${paymentId}/recieve`);
  //     router.push(`/payments/${payments[0].id}`);
  //   }, 500);
  // };

  const saveFile = async () => {
    try {
      let result;

      if (files.length > 0) {
        console.log(files.length);
        result = await supabase
          .from("files")
          .update({
            ...fileForm,
          })
          .eq("clientId", id);
      } else {
        result = await supabase.from("files").insert([
          {
            clientId: client.id,
            CIN: client.CIN,
            ...fileForm,
          },
        ]);
      }

      // error
      console.log("File result", result);

      if (result.error) {
        // console.log(result.error);
        console.log("result ERROR", result.errir);
        return;
      }

      setSaveAll((prev) => ({ ...prev, file: true }));
      fetchClientData();
    } catch (error) {
      console.log(error);
    }
  };
  const saveInstallation = async () => {
    try {
      let result;

      if (installations.length > 0) {
        const oldCompleted = installations[0]?.isCompleted;
        result = await supabase
          .from("Installations")
          .update({
            ...installationForm,
            isCompleted: installationForm.isCompleted === "true",
            PVMId: pvm[0].id,
            GTIId: gti[0].id,
            meterId: meter[0].id,
            paymentId: payments[0].id,
            fileId: files[0].id,
          })
          .eq("clientId", id);
        if (oldCompleted !== true && installationForm.isCompleted === true) {
          await createNotification({
            title: "Installation Completed",
            message: `${client.consumerName} installation completed`,
            type: "installation",
            relatedTable: "Installations",
            relatedRecordId: client.id,
          });

          toast.success("🎉 Installation Completed");
        }
        await logAudit({
          action:
            installationForm.isCompleted === true
              ? "INSTALLATION_COMPLETED"
              : "INSTALLATION_UPDATED",
          tableName: "Installations",
          recordId: client.id,
          details: {
            client: client.consumerName,
            RTSCapacity: installationForm.RTSCapacity,
            billingUnit: installationForm.billingUnit,
            isCompleted: installationForm.isCompleted,
          },
        });
        console.log("installationForm", installationForm, "result", result);
        toast.success("installation UPDATED");
        // await logAudit({
        //   action: "INSTALLATION_COMPLETED",
        //   tableName: "Installations",
        //   recordId: client.id,
        //   details: {
        //     client: client.consumerName,
        //     RTSCapacity: installationForm.RTSCapacity,
        //   },
        // });
      } else {
        result = await supabase.from("Installations").insert([
          {
            clientId: client.id,
            CIN: client.CIN,
            ...installationForm,
            isCompleted: installationForm.isCompleted === "true",
            PVMId: pvm[0].id,
            GTIId: gti[0].id,
            meterId: meter[0].id,
            paymentId: payments[0].id,
            fileId: files[0].id,
          },
        ]);
      }

      if (result.error) {
        console.log(result.error);
        return;
      }

      setSaveAll((prev) => ({ ...prev, installation: true }));
      fetchClientData();
    } catch (error) {
      console.log(error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <div className="absolute h-16 w-16 animate-spin rounded-full border-4 border-[#1e6cfc] border-t-transparent"></div>
            <div className="h-8 w-8 rounded-full bg-[#ffc600] animate-pulse"></div>
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Fetching Client Detials....
          </p>
        </div>
      </div>
    );
  }

  if (!client) {
    return <div className="p-10">Client Not Found</div>;
  }

  const done = () => {
    setTimeout(() => {
      router.push(`/clientDetails/${client.CIN}`);
    }, 1500);
  };

  return (
    <>
      <Navbar />

      <main className="pt-24 p-6 bg-gray-100 min-h-screen dark:bg-navy">
        {/* CLIENT */}
        <div className="bg-white p-6 rounded-xl shadow mb-6 dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            {client.consumerName}
          </h1>

          <p className="text-gray-700 mt-2 dark:text-white">
            CIN: {client.CIN}
          </p>

          <p className="text-gray-700 dark:text-white">
            Mobile: {client.subsidyMobile}
          </p>

          <p className="text-gray-700 dark:text-white">
            Email: {client.subsidyEmail}
          </p>

          <p className="text-gray-700 dark:text-white">
            Payment Type: {client.paymentType}
          </p>
        </div>

        {/* PVM */}
        {["developer", "admin", "sales"].includes(role) && (
          <div className="bg-white p-6 rounded-xl shadow mb-6 dark:bg-slate-900 dark:border-slate-800 dark:text-white">
            <div className="flex justify-between">
              <h2 className="text-xl font-bold mb-4  text-gray-900 dark:text-white">
                Add PVM
              </h2>
              {saveAll.pvm === true && (
                <span className="inline-flex items-center justify-center px-4 py-1.5 h-fit text-sm font-semibold rounded-full whitespace-nowrap bg-green-100 text-green-700">
                  ADDED
                </span>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <input
                placeholder="Make"
                value={pvmForm.make}
                onChange={(e) =>
                  setPvmForm({ ...pvmForm, make: e.target.value })
                }
                className="border border-gray-600 text-gray-900 mt-1 w-full rounded-lg p-2 outline-none focus:ring-2 focus:ring-gray-200 dark:text-white"
              />

              <input
                placeholder="Wattage"
                value={pvmForm.wattage}
                onChange={(e) =>
                  setPvmForm({ ...pvmForm, wattage: e.target.value })
                }
                className="border border-gray-600 text-gray-900 mt-1 w-full rounded-lg p-2 outline-none focus:ring-2 focus:ring-gray-200 dark:text-white"
              />

              <input
                placeholder="Quantity"
                value={pvmForm.quantity}
                onChange={(e) =>
                  setPvmForm({ ...pvmForm, quantity: e.target.value })
                }
                className="border border-gray-600 text-gray-900 mt-1 w-full rounded-lg p-2 outline-none focus:ring-2 focus:ring-gray-200 dark:text-white"
              />

              <input
                placeholder="Serial Number"
                value={pvmForm.serialNumber}
                onChange={(e) =>
                  setPvmForm({
                    ...pvmForm,
                    serialNumber: e.target.value,
                  })
                }
                className="border border-gray-600 text-gray-900 mt-1 w-full rounded-lg p-2 outline-none focus:ring-2 focus:ring-gray-200 dark:text-white"
              />
            </div>

            <button
              onClick={savePVM}
              className="mt-4 text-blue-900 bg-blue-300 px-4 py-2 rounded-lg"
            >
              Save PVM
            </button>
          </div>
        )}

        {/* GTI */}
        {["developer", "admin", "sales"].includes(role) && (
          <div className="bg-white p-6 rounded-xl shadow mb-6 dark:bg-slate-900 dark:border-slate-800">
            <div className="flex justify-between">
              <h2 className=" dark:text-white text-xl font-bold mb-4  text-gray-900">
                Add GTI
              </h2>
              {saveAll.gti === true && (
                <span className="inline-flex items-center justify-center px-4 py-1.5 h-fit text-sm font-semibold rounded-full whitespace-nowrap bg-green-100 text-green-700">
                  ADDED
                </span>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <input
                placeholder="Make"
                value={gtiForm.make}
                onChange={(e) =>
                  setGtiForm({ ...gtiForm, make: e.target.value })
                }
                className="border border-gray-600 text-gray-900 mt-1 w-full rounded-lg p-2 outline-none focus:ring-2 focus:ring-gray-200 dark:text-white"
              />

              <input
                placeholder="Capacity"
                value={gtiForm.capacity}
                onChange={(e) =>
                  setGtiForm({ ...gtiForm, capacity: e.target.value })
                }
                className="border border-gray-600 text-gray-900 mt-1 w-full rounded-lg p-2 outline-none focus:ring-2 focus:ring-gray-200 dark:text-white"
              />

              <input
                placeholder="Serial Number"
                value={gtiForm.serialNumber}
                onChange={(e) =>
                  setGtiForm({
                    ...gtiForm,
                    serialNumber: e.target.value,
                  })
                }
                className="border border-gray-600 text-gray-900 mt-1 w-full rounded-lg p-2 outline-none focus:ring-2 focus:ring-gray-200 dark:text-white"
              />
            </div>

            <button
              onClick={saveGTI}
              className="mt-4 text-blue-900 bg-blue-300 px-4 py-2 rounded-lg"
            >
              Save GTI
            </button>
          </div>
        )}

        {/* Meter */}
        {["developer", "admin", "sales"].includes(role) && (
          <div className="bg-white p-6 rounded-xl shadow mb-6 dark:bg-slate-900 dark:border-slate-800">
            <div className="flex justify-between">
              <h2 className=" dark:text-white text-xl font-bold mb-4  text-gray-900">
                Add Meter
              </h2>
              {saveAll.meter === true && (
                <span className="inline-flex items-center justify-center px-4 py-1.5 h-fit text-sm font-semibold rounded-full whitespace-nowrap bg-green-100 text-green-700">
                  ADDED
                </span>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <input
                placeholder="Gen. Make"
                value={meterForm.GnMake}
                onChange={(e) =>
                  setMeterForm({ ...meterForm, GnMake: e.target.value })
                }
                className="border border-gray-600 text-gray-900 mt-1 w-full rounded-lg p-2 outline-none focus:ring-2 focus:ring-gray-200 dark:text-white"
              />
              <input
                placeholder="Gen. Serial Number"
                value={meterForm.GnSerialNumber}
                onChange={(e) =>
                  setMeterForm({ ...meterForm, GnSerialNumber: e.target.value })
                }
                className="border border-gray-600 text-gray-900 mt-1 w-full rounded-lg p-2 outline-none focus:ring-2 focus:ring-gray-200 dark:text-white"
              />
              <input
                placeholder="Net Make"
                value={meterForm.netMake}
                onChange={(e) =>
                  setMeterForm({ ...meterForm, netMake: e.target.value })
                }
                className="border border-gray-600 text-gray-900 mt-1 w-full rounded-lg p-2 outline-none focus:ring-2 focus:ring-gray-200 dark:text-white"
              />
              <input
                placeholder="Net Serial Number"
                value={meterForm.netSerialNumber}
                onChange={(e) =>
                  setMeterForm({
                    ...meterForm,
                    netSerialNumber: e.target.value,
                  })
                }
                className="border border-gray-600 text-gray-900 mt-1 w-full rounded-lg p-2 outline-none focus:ring-2 focus:ring-gray-200 dark:text-white"
              />
            </div>

            <button
              onClick={saveMeter}
              className="mt-4 text-blue-900 bg-blue-300 px-4 py-2 rounded-lg"
            >
              Save Meter
            </button>
          </div>
        )}

        {/* Files */}
        {["developer", "admin", "salesb2c"].includes(role) && (
          <div className="bg-white p-6 rounded-xl shadow mb-6 dark:bg-slate-900 dark:border-slate-800">
            <div className="flex justify-between">
              <h2 className=" dark:text-white text-xl font-bold mb-4  text-gray-900">
                Add Files
              </h2>
              {saveAll.file === true && (
                <span className="inline-flex items-center justify-center px-4 py-1.5 h-fit text-sm font-semibold rounded-full whitespace-nowrap bg-green-100 text-green-700">
                  ADDED
                </span>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <input
                placeholder="File Issued"
                value={fileForm.fileIssued}
                onChange={(e) =>
                  setFileForm({ ...fileForm, fileIssued: e.target.value })
                }
                className="border border-gray-600 text-gray-900 mt-1 w-full rounded-lg p-2 outline-none focus:ring-2 focus:ring-gray-200 dark:text-white"
              />

              <input
                placeholder="Pending Documents"
                value={fileForm.documentPending}
                onChange={(e) =>
                  setFileForm({ ...fileForm, documentPending: e.target.value })
                }
                className="border border-gray-600 text-gray-900 mt-1 w-full rounded-lg p-2 outline-none focus:ring-2 focus:ring-gray-200 dark:text-white"
              />

              <input
                placeholder="Hand Over"
                value={fileForm.handOver}
                onChange={(e) =>
                  setFileForm({ ...fileForm, handOver: e.target.value })
                }
                className="border border-gray-600 text-gray-900 mt-1 w-full rounded-lg p-2 outline-none focus:ring-2 focus:ring-gray-200 dark:text-white"
              />

              <input
                placeholder="Handed TO"
                value={fileForm.handedTo}
                onChange={(e) =>
                  setFileForm({
                    ...fileForm,
                    handedTo: e.target.value,
                  })
                }
                className="border border-gray-600 text-gray-900 mt-1 w-full rounded-lg p-2 outline-none focus:ring-2 focus:ring-gray-200 dark:text-white"
              />
              <input
                placeholder="Given By"
                value={fileForm.givenBy}
                onChange={(e) =>
                  setFileForm({
                    ...fileForm,
                    givenBy: e.target.value,
                  })
                }
                className="border border-gray-600 text-gray-900 mt-1 w-full rounded-lg p-2 outline-none focus:ring-2 focus:ring-gray-200 dark:text-white"
              />
            </div>

            <button
              onClick={saveFile}
              className="mt-4 text-blue-900 bg-blue-300 px-4 py-2 rounded-lg"
            >
              Save Files Details
            </button>
          </div>
        )}

        {/* Installation */}
        {["developer", "admin", "sales"].includes(role) && (
          <div className="bg-white p-6 rounded-xl shadow mb-6 mt-6 dark:bg-slate-900 dark:border-slate-800">
            <div className="flex justify-between">
              <h2 className=" dark:text-white text-xl font-bold mb-4 text-gray-900">
                Add Installations
              </h2>
              {saveAll.installation === true && (
                <span className="inline-flex items-center justify-center px-4 py-1.5 h-fit text-sm font-semibold rounded-full whitespace-nowrap bg-green-100 text-green-700">
                  ADDED
                </span>
              )}
            </div>
            <select
              value={
                installationForm.isCompleted === null
                  ? ""
                  : installationForm.isCompleted.toString()
              }
              onChange={(e) =>
                setInstallationForm({
                  ...installationForm,
                  isCompleted:
                    e.target.value === "" ? null : e.target.value === "true",
                })
              }
              className="border border-gray-600 text-gray-900 mt-1 w-full rounded-lg p-2 dark:text-white"
            >
              <option value="">Select Status</option>
              <option value="false">Pending</option>
              <option value="true">Completed</option>
            </select>

            <div className="grid md:grid-cols-2 gap-4">
              <input
                placeholder="RTS Capacity"
                value={installationForm.RTSCapacity}
                onChange={(e) =>
                  setInstallationForm({
                    ...installationForm,
                    RTSCapacity: e.target.value,
                  })
                }
                className="border border-gray-600 text-gray-900 mt-1 w-full rounded-lg p-2 outline-none focus:ring-2 focus:ring-gray-200 dark:text-white"
              />

              <input
                placeholder="Builling Unit"
                value={installationForm.billingUnit}
                onChange={(e) =>
                  setInstallationForm({
                    ...installationForm,
                    billingUnit: e.target.value,
                  })
                }
                className="border border-gray-600 text-gray-900 mt-1 w-full rounded-lg p-2 outline-none focus:ring-2 focus:ring-gray-200 dark:text-white"
              />

              <input
                placeholder="Commissioning Date"
                value={installationForm.commissioningDate}
                onChange={(e) =>
                  setInstallationForm({
                    ...installationForm,
                    commissioningDate: e.target.value,
                  })
                }
                className="border border-gray-600 text-gray-900 mt-1 w-full rounded-lg p-2 outline-none focus:ring-2 focus:ring-gray-200 dark:text-white"
              />
            </div>
            <button
              onClick={saveInstallation}
              className="mt-4 text-blue-900 bg-blue-300 px-4 py-2 rounded-lg"
            >
              Save Installation
            </button>
          </div>
        )}
        {console.log(payments)}

        {/* Payments */}
        {["developer", "admin", "sales"].includes(role) &&
          payments?.length == 0 && (
            <div className="bg-white p-6 rounded-xl shadow mb-6 dark:bg-slate-900 dark:border-slate-800">
              <div className="flex justify-between">
                <h2 className=" dark:text-white text-xl font-bold mb-4  text-gray-900">
                  Add Payement
                </h2>
              </div>
              <Link
                href="/payments/new"
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                New Payment
              </Link>
            </div>
          )}

        {/* All Done */}
        <div className="bg-white p-6 rounded-xl shadow mb-6 max-h-max dark:bg-slate-900 dark:border-slate-800">
          <h3 className="text-xl text-red-500 mb-6">
            Before Done, Please cross check all details...
          </h3>
          <button
            className="bg-green-300 text-green-900 px-8 py-2 rounded-lg mb-6"
            onClick={done}
          >
            Done
          </button>
        </div>
      </main>
    </>
  );
}
