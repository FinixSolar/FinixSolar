"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar/page";
import { supabase } from "@/lib/supabase";


const addClient = () => {
  const [formData, setFormData] = useState({
    CIN: "",
    consumerName: "",
    consumerNumber: "",
    contactPersonName: "",
    contactPersonNumber: "",
    subsidyMobile: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting form with data:", formData);
    handleUpload(formData);
    alert("Form submitted successfully!");
  };

  const handleUpload = async (formData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: insertError } = await supabase
        .from('Clients')
        .insert(formData);

      if (insertError) throw insertError;

      setSuccess(`Successfully uploaded ${ formData.length } records to Clients.`);
    } catch (err) {
      console.log("FULL ERROR:", err);
      console.log("ERROR TYPE:", typeof err);
      console.log("ERROR KEYS:", Object.keys(err || {}));

      setError(
        err?.message ||
        JSON.stringify(err) ||
        "Upload failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <main className="flex flex-col w-full h-screen pt-25 px-10 pb-10 bg-gray-100">
        <div>
          <h1 className="text-4xl font-bold text-black">Add New Client</h1>
          <p className="mt-4 text-gray-600">Fill in the details below to add a new client.</p>
        </div>

        <div className="w-full flex items-center justify-center bg-gray-100 py-4">
          <form
            onSubmit={handleSubmit}
            className="max-w-max bg-white shadow-lg rounded-2xl p-6 space-y-5 flex flex-wrap gap-[4%]">

            {/* CIN */}
            <div className="w-[46%]">
              <label className="block text-[1.1rem] font-bold text-gray-700">CIN</label>
              <input
                type="text"
                name="CIN"
                value={formData.CIN}
                onChange={handleChange}
                className="mt-1 w-full border border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none placeholder:text-gray-600"
                placeholder="Enter CIN"
              />
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
                className="mt-1 w-full border  border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none placeholder:text-gray-600"
                placeholder="Enter consumer name"
              />
            </div>

            {/* Consumer Number */}
            <div className="w-[46%]">
              <label className="block text-[1.1rem] font-bold text-gray-700">
                Consumer Number
              </label>
              <input
                type="tel"
                name="consumerNumber"
                value={formData.consumerNumber}
                onChange={handleChange}
                className="mt-1 w-full border  border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none placeholder:text-gray-600"
                placeholder="Enter consumer number"
              />
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
                className="mt-1 w-full border  border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none placeholder:text-gray-600"
                placeholder="Enter contact person name"
              />
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
                className="mt-1 w-full border  border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none placeholder:text-gray-600"
                placeholder="Enter contact number"
              />
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
                className="mt-1 w-full border  border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none placeholder:text-gray-600"
                placeholder="Enter mobile number"
              />
            </div>

            {/* Location */}
            <div className="w-[46%]">
              <label className="block text-[1.1rem] font-bold text-gray-700">
                Consumer Location
              </label>
              <textarea
                name="location"
                value={formData.location}
                onChange={handleChange}
                rows="3"
                className="mt-1 w-full border  border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none placeholder:text-gray-600"
                placeholder="Enter location"
              />
            </div>

            {/* Submit Button */}
            <div className="w-full mt-4">
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

export default addClient;