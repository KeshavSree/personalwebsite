import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about Keshav Sreekantham - AI Infrastructure Engineer, and Software Engineer . Discover my background, skills, and journey in computer science.',
  keywords: ['about', 'Keshav Sreekantham', 'AI infrastructure', 'software engineer', 'computer science', 'biography', 'AI', 'Infrastructure'],
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
