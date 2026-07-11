import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Involvement',
  description: "Keshav Sreekantham's community and leadership involvement, including Stack, the software consulting club he helps run",
  keywords: ['involvement', 'leadership', 'Purdue Stack', 'Purdue', 'Stack', 'Keshav Sreekantham'],
};

export default function InvolvementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
