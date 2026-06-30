"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar/page";

export default function AccountPage() {
  return (
    <>
      <Navbar />

      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Account Settings</h1>

        <div className="space-y-4">
          <Link
            href="/settings/account/change-password"
            className="block border rounded-lg p-5 hover:bg-gray-50"
          >
            🔑 Change Password
          </Link>

          <Link
            href="/settings/account/change-email"
            className="block border rounded-lg p-5 hover:bg-gray-50"
          >
            📧 Change Email
          </Link>

          <Link
            href="/settings/account/delete-account"
            className="block border rounded-lg p-5 hover:bg-red-50"
          >
            ❌ Delete Account
          </Link>
        </div>
      </div>
    </>
  );
}
