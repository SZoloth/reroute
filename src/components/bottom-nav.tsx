"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Home" },
  { href: "/feed", label: "Feed" },
  { href: "/trips", label: "Trips" },
  { href: "/profile", label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  if (["/onboarding", "/admin"].includes(pathname)) {
    return null;
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-800 bg-black/90 px-3 py-2 backdrop-blur">
      <ul className="mx-auto grid max-w-md grid-cols-4 gap-2">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={`flex h-10 items-center justify-center rounded-lg text-xs ${
                  active ? "bg-zinc-100 text-zinc-900" : "text-zinc-400"
                }`}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
