"use client";
import { usePathname } from "next/navigation";
import Navbar from "@/app/components/navbar";
import { InteriorMosaicFrame } from "@/app/components/MosaicFrame";

export default function ConditionalChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  // Hide the global navbar on the home page: the hero rail carries its own
  // section nav, and showing both creates a duplicated navigation system.
  const hideNavbar = isHome;
  return (
    <>
      {!hideNavbar && <Navbar />}
      <main className={isHome ? "" : "relative isolate min-h-screen overflow-hidden"}>
        {!isHome && <InteriorMosaicFrame />}
        <div className={isHome ? "" : "relative z-10"}>{children}</div>
      </main>
    </>
  );
}
