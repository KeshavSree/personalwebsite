"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  BOTTOM_STRIP_BOX,
  BOTTOM_STRIP_VIEWBOX,
  MosaicDivider,
  SECRET_TILE_POINTS,
} from "@/app/components/mosaic";

// The unlisted door to the resume uploader. An invisible copy of the bottom
// strip's left-end tile sits exactly over the drawn one; clicking it opens a
// login, and a valid session can replace the live resume PDF. Nothing links or
// labels it — it is deliberately only findable by clicking that tile.
//
// Kept out of the tab order and hidden from assistive tech on purpose: it is not
// site navigation, and announcing "admin login" to every screen-reader user on
// /about would defeat the point. (The strip crops on narrow viewports, so the
// tile — and the door — only exist at sm and up.)
type Step = "login" | "upload";

export default function SecretResumeTile() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("login");

  const close = useCallback(() => setOpen(false), []);

  const openDoor = useCallback(() => {
    setOpen(true);
    // An unexpired cookie skips the form entirely.
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then((d) => setStep(d.authenticated ? "upload" : "login"))
      .catch(() => setStep("login"));
  }, []);

  return (
    <>
      <svg
        viewBox={BOTTOM_STRIP_VIEWBOX}
        preserveAspectRatio="xMidYMid slice"
        className={`pointer-events-none z-20 ${BOTTOM_STRIP_BOX}`}
        fill="none"
        aria-hidden="true"
      >
        {/* fill-transparent + pointerEvents="all" keeps the tile invisible while
            still catching clicks anywhere inside its outline. */}
        <polygon
          points={SECRET_TILE_POINTS}
          fill="transparent"
          pointerEvents="all"
          className="cursor-default"
          onClick={openDoor}
        />
      </svg>
      {open &&
        // Portalled to <body>: the sticky navbar is a z-40 stacking context
        // sibling of <main>, so a modal rendered inside <main> would paint
        // underneath it.
        createPortal(
          <AdminModal step={step} setStep={setStep} onClose={close} />,
          document.body,
        )}
    </>
  );
}

function AdminModal({
  step,
  setStep,
  onClose,
}: {
  step: Step;
  setStep: (s: Step) => void;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[oklch(20%_0.018_55_/_0.28)] px-5 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (!panelRef.current?.contains(e.target as Node)) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Resume"
        className="w-full max-w-[380px] rounded-[var(--radius-lg)] border border-[var(--color-hairline-strong)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-lift)]"
      >
        <MosaicDivider variant={1} className="mb-5 opacity-90" />
        {step === "login" ? (
          <LoginForm onSuccess={() => setStep("upload")} onClose={onClose} />
        ) : (
          <UploadForm onSignedOut={() => setStep("login")} onClose={onClose} />
        )}
      </div>
    </div>
  );
}

const fieldClass =
  "mt-1.5 w-full rounded-[var(--radius-sm)] border border-[var(--color-hairline-strong)] bg-[var(--color-surface-raised)] px-3 py-2 text-[15px] text-[var(--color-ink)] outline-none transition-colors focus:border-[var(--color-accent)]";
const labelClass =
  "font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--color-ink-subtle)]";
const primaryButtonClass =
  "inline-flex items-center rounded-full bg-[var(--color-accent)] px-4 py-1.5 text-[14px] text-[var(--color-surface)] transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50";
const quietButtonClass =
  "inline-flex items-center rounded-full border border-[var(--color-hairline-strong)] px-4 py-1.5 text-[14px] text-[var(--color-ink)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]";

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[19px] font-medium leading-tight tracking-[-0.01em] text-[var(--color-ink)]">
      {children}
    </h2>
  );
}

function ErrorNote({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="mt-3 text-[13.5px] text-[var(--color-mosaic-red)]">
      {children}
    </p>
  );
}

function LoginForm({ onSuccess, onClose }: { onSuccess: () => void; onClose: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const firstField = useRef<HTMLInputElement>(null);

  useEffect(() => firstField.current?.focus(), []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setPassword("");
        onSuccess();
      } else {
        setError(data.error ?? "Something went wrong.");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <Heading>Who goes there?</Heading>
      <div className="mt-5 space-y-4">
        <div>
          <label className={labelClass} htmlFor="admin-username">
            Username
          </label>
          <input
            id="admin-username"
            ref={firstField}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="admin-password">
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className={fieldClass}
          />
        </div>
      </div>
      {error && <ErrorNote>{error}</ErrorNote>}
      <div className="mt-6 flex items-center gap-3">
        <button type="submit" disabled={busy} className={primaryButtonClass}>
          {busy ? "Checking…" : "Enter"}
        </button>
        <button type="button" onClick={onClose} className={quietButtonClass}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function UploadForm({ onSignedOut, onClose }: { onSignedOut: () => void; onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/resume", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setDone(true);
      } else {
        if (res.status === 401) onSignedOut();
        setError(data.error ?? "Upload failed.");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    onSignedOut();
  }

  if (done) {
    return (
      <div>
        <Heading>Resume updated.</Heading>
        <p className="mt-3 text-[15px] leading-[1.7] text-[var(--color-ink-muted)]">
          Every Resume link on the site now points at the file you just uploaded.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <a
            href="/resume"
            target="_blank"
            rel="noopener noreferrer"
            className={primaryButtonClass}
          >
            View it
          </a>
          <button type="button" onClick={onClose} className={quietButtonClass}>
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      <Heading>New resume?</Heading>
      <p className="mt-3 text-[15px] leading-[1.7] text-[var(--color-ink-muted)]">
        Pick a PDF under 4MB. It replaces the resume everywhere on the site.
      </p>
      <input
        type="file"
        accept="application/pdf,.pdf"
        onChange={(e) => {
          setFile(e.target.files?.[0] ?? null);
          setError("");
        }}
        className="mt-5 w-full text-[14px] text-[var(--color-ink-muted)] file:mr-3 file:rounded-full file:border file:border-[var(--color-hairline-strong)] file:bg-transparent file:px-4 file:py-1.5 file:text-[14px] file:text-[var(--color-ink)] hover:file:border-[var(--color-accent)] hover:file:text-[var(--color-accent)]"
      />
      {error && <ErrorNote>{error}</ErrorNote>}
      <div className="mt-6 flex items-center gap-3">
        <button type="submit" disabled={!file || busy} className={primaryButtonClass}>
          {busy ? "Uploading…" : "Upload"}
        </button>
        <button type="button" onClick={signOut} className={quietButtonClass}>
          Sign out
        </button>
      </div>
    </form>
  );
}
