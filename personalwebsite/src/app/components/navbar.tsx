"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Menu, X } from "lucide-react";
import { MosaicNavTile } from "@/app/components/mosaic";

const NAV_ITEMS = [
  { href: "/work", label: "Work" },
  { href: "/projects", label: "Projects" },
  { href: "/involvement", label: "Involvement" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname?.startsWith(href));

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[var(--color-hairline)] bg-[var(--color-surface)]/85 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-7 py-4 md:px-8">
          <Link
            href="/"
            aria-label="Home"
            className="flex h-9 w-9 items-center justify-center text-[var(--color-ink)] transition-colors hover:text-[var(--color-accent)]"
          >
            <Home className="h-[22px] w-[22px]" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-7 md:flex">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative text-[17px] transition-colors ${
                    active
                      ? "text-[var(--color-surface)]"
                      : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                  }`}
                >
                  {active && (
                    <MosaicNavTile className="-inset-x-4 -top-[6px] -bottom-[7px]" />
                  )}
                  <span className={`relative inline-block ${active ? "-rotate-2" : ""}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-9 w-9 items-center justify-center rounded-md text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-muted)] md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile sheet */}
      <div
        className={`fixed inset-0 z-30 bg-[var(--color-surface)] transition-opacity duration-300 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="flex h-full flex-col items-start gap-6 px-6 pt-24">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`border-b pb-1 text-[28px] font-medium tracking-[-0.025em] transition-colors ${
                  active
                    ? "border-[var(--color-accent)] text-[var(--color-ink)]"
                    : "border-transparent text-[var(--color-ink)] hover:border-[var(--color-hairline-strong)] hover:text-[var(--color-accent)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
