"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function SettingsCard({ title, description, href, icon }) {
  return (
    <Link
      href={href}
      className="
      bg-white
      rounded-xl
      border
      p-6
      hover:shadow-lg
      transition-all
      hover:-translate-y-1
      flex
      justify-between
      items-center"
    >
      <div className="flex gap-4">
        <div className="text-blue-600">{icon}</div>

        <div>
          <h2 className="font-semibold text-lg">{title}</h2>

          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
      </div>

      <ChevronRight size={20} />
    </Link>
  );
}
