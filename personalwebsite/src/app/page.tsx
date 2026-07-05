import { Suspense } from "react";
import type { Metadata } from "next";
import HomeChatClient, { type ContribDay } from "@/app/HomeChatClient";

// Cap the prompt length for metadata + image so a crafted URL can't blow
// up the title or break the OG renderer's layout. Browsers truncate well
// past this in the address bar anyway.
const MAX_PROMPT = 200;

function readPromptParam(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;
  const trimmed = raw.trim().slice(0, MAX_PROMPT);
  return trimmed.length > 0 ? trimmed : null;
}

// Dynamic preview metadata for shared deep links like /?q=tell+me+about+X.
// When `q` is present, the link card (iMessage, Slack, Discord, X, LinkedIn)
// shows the prompt as the title and renders a chat-bubble OG image via
// /api/og. Without `q`, the root layout's static metadata takes over and
// the auto-discovered opengraph-image.tsx is used.
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const prompt = readPromptParam(params.q);
  if (!prompt) return {};

  const title = `Ask Keshav: “${prompt}”`;
  const description = `[[Ask the site anything.]] This link opens the chat with: “${prompt}”.`;
  const ogImage = `/api/og?q=${encodeURIComponent(prompt)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: prompt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

// Fetch the full GitHub contribution history server-side, cached for a day so
// the vertical history calendar renders instantly from the initial payload
// instead of fetching on the client each load. Trims future days and leading
// empty days here so the client just renders. Falls back to null (client fetch)
// on any error.
async function getContributionHistory(): Promise<ContribDay[] | null> {
  try {
    const res = await fetch(
      "https://github-contributions-api.jogruber.de/v4/KeshavSree?y=all",
      { next: { revalidate: 86400 } },
    );
    if (!res.ok) return null;
    const j: { contributions?: ContribDay[] } = await res.json();
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(now.getDate()).padStart(2, "0")}`;
    const days = [...(j.contributions ?? [])]
      .filter((d) => d.date <= today)
      .sort((a, b) => a.date.localeCompare(b.date));
    const first = days.findIndex((d) => d.count > 0);
    return first > 0 ? days.slice(first) : days;
  } catch {
    return null;
  }
}

// HomeChatClient calls useSearchParams() for the ?q auto-submit, which
// forces a CSR bail-out and must live under a Suspense boundary.
export default async function Page() {
  const initialHistory = await getContributionHistory();
  return (
    <Suspense fallback={null}>
      <HomeChatClient initialHistory={initialHistory} />
    </Suspense>
  );
}
