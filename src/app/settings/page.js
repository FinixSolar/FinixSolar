"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar/page";
import SettingsHeader from "@/components/settings/SettingsHeader";

export default function SettingsPage() {
  const cards = [
    {
      title: "Account",
      description: "Profile, password and email settings",
      href: "/settings/account",
    },
    {
      title: "Security",
      description: "Security preferences",
      href: "/settings/security",
    },
    {
      title: "Notifications",
      description: "Manage notifications",
      href: "/settings/notifications",
    },
    {
      title: "Users",
      description: "Manage application users",
      href: "/settings/users",
    },
  ];

  return (
    <>
      <Navbar />
      <SettingsHeader
        title="Account"
        description="Manage your personal account settings."
      />

      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        <div className="grid md:grid-cols-2 gap-6">
          {cards.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="border rounded-xl p-6 hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold">{item.title}</h2>

              <p className="text-gray-500 mt-2">{item.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
