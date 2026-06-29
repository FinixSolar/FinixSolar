"use client";

import Navbar from "@/components/Navbar/page";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function EditClient() {
  const { CIN } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    CIN: "",
    consumerName: "",
    consumerNumber: "",
    contactPersonName: "",
    contactPersonNumber: "",
    subsidyMobile: "",
    subsidyEmail: "",
    paymentType: "",
    location: "",
    latitude: "",
    longitude: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchClient();
  }, []);

  const fetchClient = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("Clients")
      .select("*")
      .eq("CIN", CIN)
      .single();

    if (error) {
      console.log(error);
      return;
    }

    setLoading(false);

    setFormData({
      CIN: data.CIN || "",
      consumerName: data.consumerName || "",
      consumerNumber: data.consumerNumber || "",
      contactPersonName: data.contactPersonName || "",
      contactPersonNumber: data.contactPersonNumber || "",
      subsidyMobile: data.subsidyMobile || "",
      subsidyEmail: data.subsidyEmail || "",
      paymentType: data.paymentType || "",
      location: data.location || "",
      latitude: data.latitude || "",
      longitude: data.longitude || "",
    });
    console.log("Fetched client data:", data);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
      },
      (error) => {
        console.log(error);
        alert("Unable to get location");
      },
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.CIN.trim()) newErrors.CIN = "CIN is required";
    if (!formData.consumerName.trim())
      newErrors.consumerName = "Consumer name is required";

    if (!formData.consumerNumber)
      newErrors.consumerNumber = "Consumer number is required";

    if (!formData.contactPersonName.trim())
      newErrors.contactPersonName = "Contact person name is required";

    if (!formData.contactPersonNumber)
      newErrors.contactPersonNumber = "Contact person number is required";

    if (!formData.subsidyMobile)
      newErrors.subsidyMobile = "Subsidy mobile is required";

    if (!formData.subsidyEmail.trim())
      newErrors.subsidyEmail = "Email is required";

    if (!formData.paymentType.trim())
      newErrors.paymentType = "Payment type is required";

    if (!formData.location.trim()) newErrors.location = "Location is required";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const { error } = await supabase
        .from("Clients")
        .update({
          CIN: formData.CIN,
          consumerName: formData.consumerName,
          consumerNumber: formData.consumerNumber,
          contactPersonName: formData.contactPersonName,
          contactPersonNumber: formData.contactPersonNumber,
          subsidyMobile: formData.subsidyMobile,
          subsidyEmail: formData.subsidyEmail,
          paymentType: formData.paymentType,
          location: formData.location,
          latitude: formData.latitude,
          longitude: formData.longitude,
        })
        .eq("CIN", CIN);

      if (error) throw error;

      setSuccess("Client updated successfully!");

      const { data: clientId } = await supabase
        .from("Clients")
        .select("id")
        .eq("CIN", formData.CIN)
        .single();

      setTimeout(() => {
        router.push(`/clients/${clientId.id}`);
      }, 1500);
    } catch (err) {
      console.log(err);
      setError(err.message);
    } finally {
      setLoading(false);
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

  return (
    <div>
      <Navbar />

      <main className="flex flex-col w-full min-h-screen pt-25 px-10 pb-10 bg-gray-100">
        <div>
          <h1 className="text-4xl font-bold text-black">Edit Client</h1>

          <p className="mt-4 text-gray-600">Update client details below.</p>
        </div>

        <div className="w-full flex items-center justify-center bg-gray-100 py-4">
          <form
            onSubmit={handleSubmit}
            className="max-w-max bg-white shadow-lg rounded-2xl p-6 space-y-5 flex flex-wrap gap-[4%]"
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
            <div className="w-[46%]">
              <label className="block text-[1.1rem] font-bold text-gray-700">
                CIN
              </label>
              <input
                type="text"
                name="CIN"
                value={formData.CIN}
                onChange={handleChange}
                placeholder="Enter CIN"
                className={`text-gray-900 mt-1 w-full rounded-lg p-2 outline-none focus:ring-2 focus:ring-gray-200
    ${errors.CIN ? "border-2 border-red-500" : "border border-gray-600"}`}
              />
              {errors.CIN && (
                <p className="text-red-500 text-sm mt-1">{errors.CIN}</p>
              )}
            </div>

            {/* Consumer Name */}
            <div className="w-[46%]">
              <label className="block text-[1.1rem] font-bold text-gray-700">
                Name of Consumer
              </label>

              <input
                type="text"
                name="consumerName"
                value={formData.consumerName}
                onChange={handleChange}
                placeholder="Enter consumer name"
                className={`text-gray-900 mt-1 w-full rounded-lg p-2 outline-none focus:ring-2 focus:ring-gray-200
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
            <div className="w-[46%]">
              <label className="block text-[1.1rem] font-bold text-gray-700">
                Consumer Number
              </label>
              <input
                type="text"
                name="consumerNumber"
                value={formData.consumerNumber}
                onChange={handleChange}
                placeholder="Enter consumer number"
                className={`text-gray-900 mt-1 w-full rounded-lg p-2 outline-none focus:ring-2 focus:ring-gray-200
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
            <div className="w-[46%]">
              <label className="block text-[1.1rem] font-bold text-gray-700">
                Contact Person Name
              </label>
              <input
                type="text"
                name="contactPersonName"
                value={formData.contactPersonName}
                onChange={handleChange}
                placeholder="Enter contact person name"
                className={`text-gray-900 mt-1 w-full rounded-lg p-2 outline-none focus:ring-2 focus:ring-gray-200
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
            <div className="w-[46%]">
              <label className="block text-[1.1rem] font-bold text-gray-700">
                Contact Person Number
              </label>
              <input
                type="tel"
                name="contactPersonNumber"
                value={formData.contactPersonNumber}
                onChange={handleChange}
                placeholder="Enter contact number"
                className={`text-gray-900 mt-1 w-full rounded-lg p-2 outline-none focus:ring-2 focus:ring-gray-200
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
            <div className="w-[46%]">
              <label className="block text-[1.1rem] font-bold text-gray-700">
                Mobile No (Registered for Subsidy)
              </label>
              <input
                type="tel"
                name="subsidyMobile"
                value={formData.subsidyMobile}
                onChange={handleChange}
                placeholder="Enter mobile number"
                className={`text-gray-900 mt-1 w-full rounded-lg p-2 outline-none focus:ring-2 focus:ring-gray-200
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
            <div className="w-[46%]">
              <label className="block text-[1.1rem] font-bold text-gray-700">
                Email (Registered for Subsidy)
              </label>
              <input
                type="text"
                name="subsidyEmail"
                value={formData.subsidyEmail}
                onChange={handleChange}
                placeholder="Enter email address"
                className={`text-gray-900 mt-1 w-full rounded-lg p-2 outline-none focus:ring-2 focus:ring-gray-200
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
            <div className="w-[46%]">
              <label className="block text-[1.1rem] font-bold text-gray-700">
                Payment Type
              </label>
              <select
                name="paymentType"
                value={formData.paymentType || ""}
                onChange={handleChange}
                className={`text-gray-900 mt-1 w-full rounded-lg p-2 outline-none focus:ring-2 focus:ring-gray-200  
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
              <label className="block text-[1.1rem] font-bold text-gray-700">
                Consumer Location
              </label>
              <textarea
                name="location"
                value={formData.location}
                onChange={handleChange}
                rows="3"
                placeholder="Enter google maps URL (https://maps.app.goo.gl/xxxxxx)"
                className={`text-gray-900 mt-1 w-full rounded-lg p-2 outline-none focus:ring-2 focus:ring-gray-200
    ${errors.location ? "border-2 border-red-500" : "border border-gray-600"}`}
              />
              {errors.location && (
                <p className="text-red-500 text-sm mt-1">{errors.location}</p>
              )}
            </div>
            <div className="w-full md:w-[46%] flex items-end justify-end">
              <button
                type="button"
                onClick={getCurrentLocation}
                className="bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                Get Current Location
              </button>
            </div>
            <div className="w-full md:w-[46%]">
              <label className="block text-[1.1rem] font-bold text-gray-700">
                Latitude
              </label>

              <input
                type="text"
                value={formData.latitude}
                readOnly
                className="w-full border p-2 rounded-lg"
              />
            </div>

            <div className="w-full md:w-[46%]">
              <label className="block text-[1.1rem] font-bold text-gray-700">
                Longitude
              </label>

              <input
                type="text"
                value={formData.longitude}
                readOnly
                className="w-full border p-2 rounded-lg"
              />
            </div>

            {/* Submit Button */}
            <div className="w-full mt-4">
              <p className="text-gray-800 text-lg mb-4">
                Submit and move to edit File details...
              </p>
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
