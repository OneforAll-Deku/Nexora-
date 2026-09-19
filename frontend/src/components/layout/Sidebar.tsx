'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  UploadCloud, 
  ReceiptText, 
  ShieldAlert, 
  KeyRound, 
  Layers,
  ShieldCheck
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Batch Ingestion', href: '/staging', icon: UploadCloud },
  { name: 'General Ledger', href: '/ledger', icon: ReceiptText },
  { name: 'Fraud & Price Surge Hub', href: '/anomalies', icon: ShieldAlert },
  { name: 'BYOK Key Vault', href: '/settings', icon: KeyRound },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-background border-r border-border flex flex-col justify-between shrink-0 min-h-screen font-body">
      <div>
        <Link
          href="/"
          className="h-20 flex items-center gap-3 px-6 border-b border-border bg-secondary/30 hover:bg-secondary/60 transition-colors group cursor-pointer"
          title="Return to Landing Page"
        >
          <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform overflow-hidden p-1">
            <img src="/logo.png" alt="Nexora Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-lg text-foreground tracking-tight">Nexora</span>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium">Enterprise Invoice ERP</p>
          </div>
        </Link>

        <nav className="p-4 space-y-1.5">
          <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Platform Modules
          </div>
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-accent/10 text-accent font-semibold border border-accent/20 shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-accent' : 'text-muted-foreground'}`} />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border border-border m-4 rounded-2xl bg-secondary/50">
        <div className="flex items-center gap-2 mb-1.5">
          <ShieldCheck className="w-4 h-4 text-accent" />
          <span className="text-xs font-semibold text-foreground font-display">Zero-Cost Architecture</span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Powered by Gemini &amp; OpenRouter AI + Cloudflare R2 zero-egress. $0/mo hosting overhead.
        </p>
      </div>
    </aside>
  );
}
