import workJson from './work.json';

// Raw shape as authored in work.json (single source of truth for /work).
export interface WorkEntry {
  role: string;
  company: string;
  logo: string;
  startDate: string;
  endDate: string;
  highlights: string[];
}

// Display shape consumed by the work timeline.
export interface JobEntry {
  title: string;
  company: string;
  year: string; // combined "start - end" range
  highlights: string[];
  icon: string; // path to logo under /public
}

export function getJobs(): JobEntry[] {
  return (workJson as WorkEntry[]).map((w) => ({
    title: w.role,
    company: w.company,
    year: `${w.startDate} - ${w.endDate}`,
    highlights: w.highlights,
    icon: w.logo,
  }));
}
