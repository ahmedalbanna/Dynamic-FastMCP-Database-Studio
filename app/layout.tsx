import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Dynamic FastMCP Database Studio',
  description: 'Database-Driven Dynamic FastMCP Tool Management System & Admin UI for AI Agents',
  openGraph: {
    title: 'Dynamic FastMCP Database Studio',
    description: 'Database-Driven Dynamic FastMCP Tool Management System & Admin UI for AI Agents',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dynamic FastMCP Database Studio',
    description: 'Database-Driven Dynamic FastMCP Tool Management System & Admin UI for AI Agents',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
