"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar/page";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import toast from "react-hot-toast";

const initialTempFormData = {
  CIN: "",
  consumerName: "",
  consumerNumber: "",
  contactPersonName: "",
  contactPersonNumber: "",
  subsidyMobile: "",
  subsidyEmail: "",
  paymentType: "",

  address: "",

  locationMethod: "current",

  googleMapLink: "",

  location: "",
  latitude: "",
  longitude: "",
};

export default function AddClient() {
  const { user } = useAuth();
  const [tempFromData, setTempFormData] = useState(initialTempFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const getCurrentLocation = () => {
    setError("");
    setSuccess("");

    if (!navigator.geolocation) {
      setError("Geolocation is not supported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        // Generate Google Maps Link
        const googleMapLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

        setTempFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          // location: data.display_name || "",
          // address: data.display_name || "",
          googleMapLink:
            prev.googleMapLink ||
            `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
        }));

        await reverseGeocode(lat, lng);
      },
      (error) => {
        console.log(error);
        setError("Unable to get current location.");
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  };

  const extractLocation = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/extract-location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: tempFromData.googleMapLink,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error("Unable to resolve Google Maps link");
      }

      const finalUrl = data.finalUrl;

      let lat = null;
      let lng = null;

      // Format 1: @lat,lng
      let match = null;

      // Format 1 (BEST): Google Place coordinates
      // Example:
      // !8m2!3d20.9848064!4d75.5948749
      match = finalUrl.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);

      if (match) {
        lat = parseFloat(match[1]);
        lng = parseFloat(match[2]);
      }

      // Format 2: @lat,lng (map center)
      if (!lat || !lng) {
        match = finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);

        if (match) {
          lat = parseFloat(match[1]);
          lng = parseFloat(match[2]);
        }
      }

      // Format 3: query=lat,lng
      if (!lat || !lng) {
        match = finalUrl.match(/query=(-?\d+\.\d+),(-?\d+\.\d+)/);

        if (match) {
          lat = parseFloat(match[1]);
          lng = parseFloat(match[2]);
        }
      }

      // Format 4: q=lat,lng
      if (!lat || !lng) {
        match = finalUrl.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);

        if (match) {
          lat = parseFloat(match[1]);
          lng = parseFloat(match[2]);
        }
      }

      // Format 3: q=lat,lng
      if (!lat || !lng) {
        match = finalUrl.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);

        if (match) {
          lat = parseFloat(match[1]);
          lng = parseFloat(match[2]);
        }
      }

      if (!lat || !lng) {
        throw new Error("Coordinates not found");
      }

      await reverseGeocode(lat, lng);

      setSuccess("Location extracted successfully");
    } catch (error) {
      console.log(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      );

      const data = await response.json();

      const address = data.address || {};

      setTempFormData((prev) => ({
        ...prev,

        latitude: lat,
        longitude: lng,

        location: data.display_name || "",

        address: data.display_name || "",
      }));
    } catch (error) {
      console.log(error);
      setError("Failed to fetch address.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setTempFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    let fieldError = "";

    const nameRegex = /^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/;

    switch (name) {
      case "consumerName":
        if (value && !nameRegex.test(value.trim())) {
          fieldError = "Only alphabets are allowed";
        }
        break;

      case "contactPersonName":
        if (value && !nameRegex.test(value.trim())) {
          fieldError = "Only alphabets are allowed";
        }
        break;

      case "consumerNumber":
        if (value && !/^\d+$/.test(value)) {
          fieldError = "Only numbers are allowed";
        }
        break;

      case "contactPersonNumber":
        if (value && !/^\d{0,10}$/.test(value)) {
          fieldError = "Only numbers are allowed";
        } else if (value.length > 0 && value.length < 10) {
          fieldError = "Contact number must be 10 digits";
        }
        break;

      case "subsidyMobile":
        if (value && !/^\d{0,10}$/.test(value)) {
          fieldError = "Only numbers are allowed";
        } else if (value.length > 0 && value.length < 10) {
          fieldError = "Mobile number must be 10 digits";
        }
        break;
      case "subsidyEmail":
        if (value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value.trim())) {
            fieldError = "Invalid email address";
          }
        }
        break;
      case "paymentType":
        if (!value) {
          fieldError = "Payment type is required";
        }
        break;

      default:
        break;
    }

    setErrors((prev) => ({
      ...prev,
      [name]: fieldError,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    const nameRegex = /^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/;

    // Required validations

    if (!tempFromData.CIN.trim()) {
      newErrors.CIN = "CIN is required";
    }

    if (!tempFromData.consumerName.trim()) {
      newErrors.consumerName = "Consumer name is required";
    } else if (!nameRegex.test(tempFromData.consumerName.trim())) {
      newErrors.consumerName = "Only alphabets are allowed";
    }

    if (!tempFromData.consumerNumber.trim()) {
      newErrors.consumerNumber = "Consumer number is required";
    } else if (!/^\d+$/.test(tempFromData.consumerNumber)) {
      newErrors.consumerNumber = "Only numbers are allowed";
    }

    if (
      tempFromData.contactPersonName &&
      !nameRegex.test(tempFromData.contactPersonName.trim())
    ) {
      newErrors.contactPersonName = "Only alphabets are allowed";
    }

    if (
      tempFromData.contactPersonNumber &&
      !/^\d{10}$/.test(tempFromData.contactPersonNumber)
    ) {
      newErrors.contactPersonNumber = "Contact number must be 10 digits";
    }

    if (!tempFromData.subsidyMobile.trim()) {
      newErrors.subsidyMobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(tempFromData.subsidyMobile)) {
      newErrors.subsidyMobile = "Mobile number must be 10 digits";
    }

    if (!tempFromData.subsidyEmail.trim()) {
      newErrors.subsidyEmail = "Email is required";
    }
    if (tempFromData.subsidyEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(tempFromData.subsidyEmail.trim())) {
        newErrors.subsidyEmail = "Invalid email address";
      }
    }
    if (!tempFromData.paymentType) {
      newErrors.paymentType = "Payment type is required";
    }

    if (!tempFromData.address.trim()) {
      newErrors.address = "Address is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleUpload = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    const clientData = {
      CIN: tempFromData.CIN,
      consumerName: tempFromData.consumerName,
      consumerNumber: tempFromData.consumerNumber,
      contactPersonName:
        tempFromData.contactPersonName || tempFromData.consumerName,
      contactPersonNumber:
        tempFromData.contactPersonNumber || tempFromData.subsidyMobile,
      subsidyMobile: tempFromData.subsidyMobile,
      subsidyEmail: tempFromData.subsidyEmail,
      paymentType: tempFromData.paymentType,

      address: tempFromData.address,

      location: tempFromData.location,

      latitude: tempFromData.latitude,
      longitude: tempFromData.longitude,

      locationmethod: tempFromData.locationMethod,

      googlemaplink: tempFromData.googleMapLink,
    };
    if (!clientData.latitude || !clientData.longitude) {
      throw new Error("Please fetch coordinates before submitting the form.");
    }
    try {
      if (!navigator.onLine) {
        throw new Error("No internet connection.");
      }

      // const validationError = validateForm();

      // if (validationError) {
      //   throw new Error(validationError);
      // }

      const { data: client, error: insertError } = await supabase
        .from("Clients")
        .insert([clientData])
        .select()
        .single();

      if (insertError) {
        switch (insertError.code) {
          case "23505":
            throw new Error(
              "This client already exists. Duplicate records are not allowed.",
            );

          case "23503":
            throw new Error("Referenced record does not exist.");

          case "42501":
            throw new Error("Permission denied. Check Supabase RLS policies.");

          case "23502":
            throw new Error("Required field missing.");

          default:
            throw new Error(insertError.message || "Database error occurred.");
        }
      }

      setSuccess("Client added successfully.");
      toast.success("Client added successfully.");
      await supabase.from("notifications").insert([
        {
          title: "New Client Added",
          message: `${client.consumerName} was added`,
          type: "client",
          recipient_id: user.id,
          created_by: user.id,
          creator_name: user.user_metadata?.full_name,
          related_table: "Clients",
          related_record_id: client.id,
        },
      ]);

      await logAudit({
        action: `New Client Added`,
        tableName: "Clients",
        recordId: client.id,
        client_id: client.id,
        details: {
          client: client.consumerName,
          CIN: client.CIN,
        },
      });

      setTempFormData(initialTempFormData);
      return client;
    } catch (err) {
      console.log("SUPABASE ERROR:", err);

      setError(err?.message || "Something went wrong while saving the client.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    const isValid = validateForm();
    console.log("Validation errors:", errors);
    if (!isValid) return;

    let client = await handleUpload();

    router.push(`/clients/${client.id}`);
  };

  const logAudit = async ({
    action,
    tableName,
    recordId,
    details,
    client_id,
  }) => {
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      user_name: user.user_metadata?.full_name,
      action,
      table_name: tableName,
      record_id: recordId,
      client_id: client_id,
      details,
    });
  };

  return (
    <div>
      <Navbar />

      <main className="flex flex-col w-full min-h-screen pt-25 px-10 pb-10">
        <div>
          <h1 className="text-4xl font-bold text-black dark:text-gray-100">
            Add New Client
          </h1>

          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Fill in the details below to add a new client.
          </p>
        </div>

        <div className="w-full flex items-center justify-center bg-gray-100 py-4 mt-4 rounded-2xl dark:bg-slate-900 dark:border-slate-800">
          <form
            onSubmit={handleSubmit}
            className="max-w-max bg-white shadow-lg rounded-2xl p-6 space-y-5 flex flex-wrap gap-[4%] flex-col md:flex-row dark:bg-slate-900 dark:border-slate-800"
          >
            {error && (
              <div className="w-full p-3 rounded-lg bg-red-100 border border-red-300 text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="w-full p-3 rounded-lg bg-green-100 border border-green-300 text-green-700">
                {success}
              </div>
            )}

            {/* CIN */}
            <div className="w-full md:w-[46%]">
              <label className="block text-[1.1rem] font-bold text-gray-700  dark:text-gray-100">
                CIN
              </label>
              <input
                type="text"
                name="CIN"
                value={tempFromData.CIN}
                onChange={handleChange}
                placeholder="Enter CIN"
                className={`text-gray-900 dark:text-gray-100 mt-1 w-full rounded-lg p-2 outline-none focus:ring-2 focus:ring-gray-200
    ${errors.CIN ? "border-2 border-red-500" : "border border-gray-600"}`}
              />
              {errors.CIN && (
                <p className="text-red-500 text-sm mt-1">{errors.CIN}</p>
              )}
            </div>

            {/* Consumer Name */}
            <div className="w-full md:w-[46%]">
              <label className="block text-[1.1rem] font-bold text-gray-700  dark:text-gray-100">
                Name of Consumer
              </label>

              <input
                type="text"
                name="consumerName"
                value={tempFromData.consumerName}
                onChange={handleChange}
                placeholder="Enter consumer name"
                className={`text-gray-900 dark:text-gray-100 mt-1 w-full rounded-lg p-2 outline-none focus:ring-2 focus:ring-gray-200
    ${
      errors.consumerName ? "border-2 border-red-500" : "border border-gray-600"
    }`}
              />

              {errors.consumerName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.consumerName}
                </p>
              )}
            </div>

            {/* Consumer Number */}
            <div className="w-full md:w-[46%]">
              <label className="block text-[1.1rem] font-bold text-gray-700  dark:text-gray-100">
                Consumer Number
              </label>
              <input
                type="text"
                name="consumerNumber"
                value={tempFromData.consumerNumber}
                onChange={handleChange}
                placeholder="Enter consumer number"
                className={`text-gray-900 dark:text-gray-100 mt-1 w-full rounded-lg p-2 outline-none focus:ring-2 focus:ring-gray-200
    ${
      errors.consumerNumber
        ? "border-2 border-red-500"
        : "border border-gray-600"
    }`}
              />
              {errors.consumerNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.consumerNumber}
                </p>
              )}
            </div>

            {/* Contact Person Name */}
            <div className="w-full md:w-[46%]">
              <label className="block text-[1.1rem] font-bold text-gray-700  dark:text-gray-100">
                Contact Person Name
              </label>
              <input
                type="text"
                name="contactPersonName"
                value={tempFromData.contactPersonName}
                onChange={handleChange}
                placeholder="Enter contact person name"
                className={`text-gray-900 dark:text-gray-100 mt-1 w-full rounded-lg p-2 outline-none focus:ring-2 focus:ring-gray-200
    ${
      errors.contactPersonName
        ? "border-2 border-red-500"
        : "border border-gray-600"
    }`}
              />
              {errors.contactPersonName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.contactPersonName}
                </p>
              )}
            </div>

            {/* Contact Person Number */}
            <div className="w-full md:w-[46%]">
              <label className="block text-[1.1rem] font-bold text-gray-700  dark:text-gray-100">
                Contact Person Number
              </label>
              <input
                type="tel"
                name="contactPersonNumber"
                value={tempFromData.contactPersonNumber}
                onChange={handleChange}
                placeholder="Enter contact number"
                className={`text-gray-900 dark:text-gray-100 mt-1 w-full rounded-lg p-2 outline-none focus:ring-2 focus:ring-gray-200
    ${
      errors.contactPersonNumber
        ? "border-2 border-red-500"
        : "border border-gray-600"
    }`}
              />
              {errors.contactPersonNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.contactPersonNumber}
                </p>
              )}
            </div>

            {/* Subsidy Mobile */}
            <div className="w-full md:w-[46%]">
              <label className="block text-[1.1rem] font-bold text-gray-700  dark:text-gray-100">
                Mobile No (Registered for Subsidy)
              </label>
              <input
                type="tel"
                name="subsidyMobile"
                value={tempFromData.subsidyMobile}
                onChange={handleChange}
                placeholder="Enter mobile number"
                className={`text-gray-900 dark:text-gray-100 mt-1 w-full rounded-lg p-2 outline-none focus:ring-2 focus:ring-gray-200
    ${
      errors.subsidyMobile
        ? "border-2 border-red-500"
        : "border border-gray-600"
    }`}
              />
              {errors.subsidyMobile && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.subsidyMobile}
                </p>
              )}
            </div>

            {/* Subsidy Email */}
            <div className="w-full md:w-[46%]">
              <label className="block text-[1.1rem] font-bold text-gray-700  dark:text-gray-100">
                Email (Registered for Subsidy)
              </label>
              <input
                type="text"
                name="subsidyEmail"
                value={tempFromData.subsidyEmail}
                onChange={handleChange}
                placeholder="Enter email address"
                className={`text-gray-900 dark:text-gray-100 mt-1 w-full rounded-lg p-2 outline-none focus:ring-2 focus:ring-gray-200
    ${
      errors.subsidyEmail ? "border-2 border-red-500" : "border border-gray-600"
    }`}
              />
              {errors.subsidyEmail && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.subsidyEmail}
                </p>
              )}
            </div>

            {/* Payment Type */}
            <div className="w-full md:w-[46%]">
              <label className="block text-[1.1rem] font-bold text-gray-700  dark:text-gray-100">
                Payment Type
              </label>
              <select
                name="paymentType"
                value={tempFromData.paymentType || ""}
                onChange={handleChange}
                className={`text-gray-900 dark:text-gray-100 mt-1 w-full rounded-lg p-2 appearance-none dark:bg-slate-900 dark:border-slate-800 outline-none focus:ring-2 focus:ring-gray-200  dropd 
    ${errors.paymentType ? "border-2 border-red-500" : "border border-gray-600"}`}
              >
                <option value="">Select payment type</option>
                <option value="Cash">Cash</option>
                <option value="Online">Online</option>
                <option value="Loan">Loan</option>
              </select>
              {errors.paymentType && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.paymentType}
                </p>
              )}
            </div>

            {/* Location */}
            <div className="w-full md:w-[46%]">
              <label className="block text-[1.1rem] font-bold text-gray-700  dark:text-gray-100">
                Full Address
              </label>

              <textarea
                name="address"
                rows={4}
                value={tempFromData.address}
                onChange={handleChange}
                placeholder="Enter complete address"
                className={`text-gray-900 dark:text-gray-100 mt-1 w-full rounded-lg p-2 outline-none focus:ring-2 focus:ring-gray-200 ${
                  errors.address
                    ? "border-2 border-red-500"
                    : "border border-gray-600"
                }`}
              />

              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address}</p>
              )}
            </div>

            <div className="w-full md:w-[46%]">
              <label className="block text-[1.1rem] font-bold text-gray-700  dark:text-gray-100 mb-3">
                Location Method
              </label>

              <div className="flex gap-6 mb-4">
                <label className="flex items-center gap-2 text-gray-700 dark:text-gray-400">
                  <input
                    type="radio"
                    name="locationMethod"
                    value="current"
                    checked={tempFromData.locationMethod === "current"}
                    onChange={handleChange}
                  />
                  Current Location
                </label>

                <label className="flex items-center gap-2 text-gray-700 dark:text-gray-400">
                  <input
                    type="radio"
                    name="locationMethod"
                    value="googleLink"
                    checked={tempFromData.locationMethod === "googleLink"}
                    onChange={handleChange}
                  />
                  Google Maps Link
                </label>
              </div>

              {tempFromData.locationMethod === "current" && (
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  Get Current Location
                </button>
              )}
              {tempFromData.googleMapLink && (
                <div className="mt-3">
                  <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-400">
                    Google Maps Link
                  </label>

                  <input
                    type="text"
                    value={tempFromData.googleMapLink}
                    readOnly
                    className="text-gray-900 dark:text-gray-100 border-2 rounded-lg  p-2 w-full my-2 outline-none mb-4 focus:ring-2 focus:ring-gray-200"
                  />

                  <a
                    href={tempFromData.googleMapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="max-w-max text-gray-900 dark:text-gray-600 dark:bg-gray-200 text-sm rounded-full bg-gray-300 py-2 px-4 flex justify-between items-center gap-2"
                  >
                    <span> Open in Google Maps</span>
                    <span className="material-symbols-outlined">
                      open_in_new
                    </span>
                  </a>
                </div>
              )}

              {tempFromData.locationMethod === "googleLink" && (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={tempFromData.googleMapLink}
                    className="text-gray-900 dark:text-gray-100 border-2 rounded-lg  p-2 w-full my-2 outline-none mt-4 focus:ring-2 focus:ring-gray-200"
                    onChange={(e) =>
                      setTempFormData({
                        ...tempFromData,
                        googleMapLink: e.target.value,
                      })
                    }
                    placeholder="Paste Google Maps Link"
                  />

                  <button
                    type="button"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                    onClick={extractLocation}
                  >
                    Extract Location
                  </button>
                </div>
              )}
            </div>
            <div className="w-full md:w-[46%] py-2">
              <label className="block text-[1.1rem] font-bold text-gray-700  dark:text-gray-100">
                Latitude
              </label>

              <input
                type="text"
                value={tempFromData.latitude}
                readOnly
                className="w-full border p-2 rounded-lg"
              />
            </div>

            <div className="w-full md:w-[46%] py-2">
              <label className="block text-[1.1rem] font-bold text-gray-700  dark:text-gray-100">
                Longitude
              </label>

              <input
                type="text"
                value={tempFromData.longitude}
                readOnly
                className="w-full border p-2 rounded-lg"
              />
            </div>

            {/* Submit Button */}
            <div className="w-full mt-4">
              <button
                type="submit"
                disabled={loading}
                className={`px-5 py-2 text-white rounded-lg transition ${
                  loading
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
