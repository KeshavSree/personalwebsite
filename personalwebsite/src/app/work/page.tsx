import { getJobs } from "@/data/workData";
import { WorkTimelineClient } from "./WorkTimelineClient";
import { HashScroller } from "@/app/components/HashScroller";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Work",
  description: "Keshav Sreekantham's work experience, roles, and professional timeline.",
};

export default function WorkPage() {
  const jobs = getJobs();
  return (
    <>
      <HashScroller />
      <WorkTimelineClient jobs={jobs} />
    </>
  );
}
