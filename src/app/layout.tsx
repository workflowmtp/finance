import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FinanceAdvisor V4 — MULTIPRINT S.A.',
  description: 'Cockpit de Direction Financière augmenté par IA',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-theme="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
