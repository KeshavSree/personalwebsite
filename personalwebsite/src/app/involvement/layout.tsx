import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Involvement',
  description: "Keshav Sreekantham's [[community and leadership involvement, including buildpurdue, the campus accelerator he co-founded and runs at Purdue.]]",
  keywords: ['involvement', 'leadership', 'buildpurdue', 'accelerator', 'entrepreneurship', 'Purdue', 'Keshav Sreekantham'],
};

export default function InvolvementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
