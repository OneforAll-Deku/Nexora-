import React from 'react';
import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Nexora — Enterprise Intelligent Invoice ERP',
  description: 'Automate your busywork with intelligent agents that learn, adapt, and execute—so your team can focus on what matters most.',
  icons: {
    icon: '/icon.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        suppressHydrationWarning 
        className="bg-background text-foreground min-h-screen antialiased font-body selection:bg-accent/20 selection:text-accent"
      >
        {children}
      </body>
    </html>
  );
}
