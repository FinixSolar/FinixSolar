"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { User, Shield, Bell, Users, Settings } from "lucide-react";

const menu = [
  {
    title: "Overview",
    href: "/settings",
    icon: <Settings size={18} />,
  },
  {
    title: "Account",
    href: "/settings/account",
    icon: <User size={18} />,
  },
  {
    title: "Security",
    href: "/settings/security",
    icon: <Shield size={18} />,
  },
  {
    title: "Notifications",
    href: "/settings/notifications",
    icon: <Bell size={18} />,
  },
  {
    title: "Users",
    href: "/settings/users",
    icon: <Users size={18} />,
  },
];

export default function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-white border rounded-xl p-4">
      <h2 className="font-bold text-xl mb-4">Settings</h2>

      <nav className="space-y-2">
        {menu.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 transition

                ${active ? "bg-blue-600 text-white" : "hover:bg-gray-100"}
              `}
            >
              {item.icon}
              {item.title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
