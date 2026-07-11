import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Work Experience',
  description: 'Discover Keshav Sreekantham\'s work experience including roles in AI Infrastructure, Machine Learning, Software Engineering.',
  keywords: ['work experience', 'career', 'software engineering', 'internships', 'AI infrastructure', 'Keshav Sreekantham'],
};

export default function WorkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
