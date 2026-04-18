"use client";

import { usePathname } from "next/navigation";

import { NavBar } from "@/components/NavBar";

/** Routes where the main nav is hidden (full-bleed marketing / auth layouts). */
const HIDE_NAV_PREFIXES = ["/login"];

export function NavBarGate() {
  const pathname = usePathname();

  if (
    pathname &&
    HIDE_NAV_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  ) {
    return null;
  }

  return <NavBar />;
}
