"use client";
import { usePathname } from "next/navigation";
import Navbar from "@/app/components/navbar";
import { InteriorMosaicFrame } from "@/app/components/MosaicFrame";
import SecretResumeTile from "@/app/components/SecretResumeTile";

export default function ConditionalChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  // The unlisted resume uploader lives on one mosaic tile, on /about only.
  const showSecretTile = pathname === "/about";
  // Hide the global navbar on the home page: the hero rail carries its own
  // section nav, and showing both creates a duplicated navigation system.
  const hideNavbar = isHome;
  return (
    <>
      {!hideNavbar && <Navbar />}
      <main className={isHome ? "" : "relative isolate min-h-screen overflow-hidden"}>
        {!isHome && <InteriorMosaicFrame />}
        <div className={isHome ? "" : "relative z-10"}>{children}</div>
        {showSecretTile && <SecretResumeTile />}
      </main>
    </>
  );
}
