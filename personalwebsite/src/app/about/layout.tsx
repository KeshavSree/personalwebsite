import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about Keshav Sreekantham - [[AI Infrastructure Engineer, ML Engineer, and Researcher . Discover my background, skills, and journey in computer science and AI.]]',
  keywords: ['about', 'Keshav Sreekantham', 'machine learning', 'software engineer', 'researcher', 'computer science', 'biography', 'AI', 'Infrastructure'],
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
