import HomeChatClient, { type ContribDay } from "@/app/HomeChatClient";

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

export default async function Page() {
  const initialHistory = await getContributionHistory();
  return <HomeChatClient initialHistory={initialHistory} />;
}
