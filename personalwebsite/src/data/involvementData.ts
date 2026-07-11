import involvementJson from './involvement.json';

export interface Contribution {
  area: string;
  detail: string;
}

// Display shape consumed by /involvement. Arrays are always present (defaulted
// to []) so the component can safely check `.length`.
export interface InvolvementEntry {
  slug: string;
  title: string;
  role: string;
  date: string;
  link?: string;
  whatIsIt?: string;
  whatsMyRole?: string;
  contributions: Contribution[];
  howItShapedMe: string[];
  highlights: string[];
}

// Raw shape as authored in involvement.json (single source of truth). Optional
// fields may be omitted per entry.
interface RawInvolvement {
  slug: string;
  title: string;
  role: string;
  date?: string;
  link?: string;
  whatIsIt?: string;
  whatsMyRole?: string;
  contributions?: Contribution[];
  howItShapedMe?: string[];
  highlights?: string[];
}

export function getInvolvements(): InvolvementEntry[] {
  return (involvementJson as RawInvolvement[]).map((i) => ({
    slug: i.slug,
    title: i.title,
    role: i.role,
    date: i.date ?? '',
    link: i.link,
    whatIsIt: i.whatIsIt,
    whatsMyRole: i.whatsMyRole,
    contributions: i.contributions ?? [],
    howItShapedMe: i.howItShapedMe ?? [],
    highlights: i.highlights ?? [],
  }));
}

export function getInvolvementBySlug(slug: string): InvolvementEntry | undefined {
  return getInvolvements().find((i) => i.slug === slug);
}
