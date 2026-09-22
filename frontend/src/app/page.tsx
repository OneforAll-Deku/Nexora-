'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronRight, 
  Search, 
  Bell, 
  Check, 
  Plus, 
  MoreVertical, 
  CheckCircle2,
  Clock,
  Send,
  Home,
  ListTodo,
  ArrowLeftRight,
  CreditCard,
  DollarSign,
  Landmark,
  Settings,
  SlidersHorizontal,
  X,
  ShieldCheck,
  Cpu,
  Layers,
  FileSpreadsheet,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  Zap,
  BarChart3,
  Lock,
  UploadCloud,
  ShieldAlert,
  FileText,
  TrendingUp,
  Calculator,
  KeyRound,
  Scale,
  Building2,
  Mail,
  User,
  ReceiptText,
  Percent,
  ScanLine,
  CheckCheck,
  RefreshCw,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GithubIcon } from '@/components/ui/GithubIcon';

export default function SaaSLandingPage() {
  const [activeModal, setActiveModal] = useState<'video' | 'demo' | 'pricing' | 'about' | 'contact' | null>(null);
  const [previewTab, setPreviewTab] = useState<'overview' | 'anomalies' | 'invoices' | 'vault'>('overview');
  const [previewPeriod, setPreviewPeriod] = useState<'30d' | '7d'>('30d');
  const [calculatorVolume, setCalculatorVolume] = useState<number>(500);
  const [activePipelineStage, setActivePipelineStage] = useState<number>(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [demoForm, setDemoForm] = useState({ name: '', email: '', company: '', volume: '50-200' });
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [copiedClone, setCopiedClone] = useState(false);

  const handleCopyClone = () => {
    navigator.clipboard.writeText('git clone https://github.com/OneforAll-Deku/Nexora-.git');
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 2000);
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDemoSubmitted(true);
    setTimeout(() => {
      setActiveModal(null);
      setDemoSubmitted(false);
    }, 2000);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const hoursSaved = Math.round((calculatorVolume * 15) / 60);
  const legacyCost = Math.round(calculatorVolume * 0.35 + 500);
  const anomaliesPrevented = Math.max(1, Math.round(calculatorVolume * 0.065));

  const pipelineStages = [
    {
      id: 0,
      title: 'Multimodal Ingestion',
      icon: UploadCloud,
      badge: 'Zero-Egress R2',
      summary: 'Direct streaming of PDF documents, receipts, or smartphone photos with automated resolution optimization.',
      details: 'Invoices bypass brittle OCR template setups. Powered by Gemini 2.5 Flash, documents are parsed directly via multimodal vision tokens and structured into strict typed JSON schemas.',
      codePreview: `{\n  "vendor_name": "Apex Cloud Systems",\n  "invoice_number": "INV-2026-904",\n  "subtotal": 4850.00,\n  "tax_amount": 412.25,\n  "total_amount": 5262.25,\n  "confidence_score": 0.994\n}`,
      bullets: [
        'Direct Cloudflare R2 object ingestion with zero egress fees',
        'Gemini 2.5 Flash multimodal token parsing',
        'Automatic Pydantic schema validation'
      ]
    },
    {
      id: 1,
      title: 'Math & Duplicate Guard',
      icon: Calculator,
      badge: 'Arithmetic Check',
      summary: 'Continuous deterministic cross-check preventing arithmetic mismatches and double-billing fraud.',
      details: 'Every line item is multiplied (quantity x unit price) and summed against declared subtotal and taxes. Discrepancies > $0.05 are flagged, and invoice numbers are collision-checked across existing ledger records.',
      codePreview: `Line Items Sum:   $4,850.00\nDeclared Subtotal: $4,850.00 (Match OK)\nCalculated Tax:    $  412.25 (Match OK)\nGrand Total Check: $5,262.25 == $5,262.25\nDuplicate Status:  Clean (Hash verified)`,
      bullets: [
        'Deterministic line-by-line arithmetic auditing',
        'Vendor duplicate collision prevention',
        'Zero-tolerance discrepancy alerts (> $0.05)'
      ]
    },
    {
      id: 2,
      title: 'Price Surge Z-Score',
      icon: TrendingUp,
      badge: 'Statistical Anomaly',
      summary: 'Historical baseline comparison tagging price surges greater than 2.5 standard deviations (sigma).',
      details: 'Every line item is compared against historical SKU unit prices for that vendor. If a unit price exceeds the historical mean by >= 2.5 standard deviations, it is flagged for manual review with calculated variance.',
      codePreview: `SKU: "AWS Compute Cluster Node"\nHistorical Mean:   $120.00 / unit\nCurrent Invoiced:  $195.00 / unit\nVariance:          +62.5% surge\nStatistical Score: Z = 2.84σ (FLAGGED)`,
      bullets: [
        'Statistical Z-score unit price surge identification',
        'Continuous SKU baseline updates in Supabase',
        'Color-coded risk severity tags'
      ]
    },
    {
      id: 3,
      title: 'Reconciliation & Export',
      icon: FileSpreadsheet,
      badge: 'Multi-Sheet Hub',
      summary: 'Side-by-side verification workspace with 1-click export to 3-sheet Excel, CSV, and PDF remittance.',
      details: 'Reconciliation workspace displays the original scan on the left with pan/zoom and editable verified fields on the right. Approved records generate styled Excel workbooks with soft-red anomaly alerts.',
      codePreview: `Master Workbook:  Nexora_Master_Ledger.xlsx\n• Sheet 1:        Invoice Summary & Signoffs\n• Sheet 2:        Granular Line Items\n• Sheet 3:        Audit Anomaly Log (Soft-Red)\nAlso includes:    General_Ledger.csv, Remittance.pdf`,
      bullets: [
        'Side-by-side split screen with interactive canvas controls',
        '3-sheet styled Excel workbook with conditional alerts',
        'Standard QuickBooks/Xero ledger CSV export'
      ]
    }
  ];

  const comparisonItems = [
    {
      metric: 'Monthly Platform License',
      icon: DollarSign,
      nexora: '$0.00 / month (Permanent Free-Tier)',
      legacy: '$500 – $2,500 / month per seat',
      nexoraWin: true
    },
    {
      metric: 'Document Extraction Cost',
      icon: Zap,
      nexora: '$0.00 (1,500 free daily reqs via Gemini BYOK)',
      legacy: '$0.30 – $0.50 per page fee',
      nexoraWin: true
    },
    {
      metric: 'Extraction AI Engine',
      icon: Cpu,
      nexora: 'Gemini 2.5 Flash Multimodal OCR',
      legacy: 'Brittle template OCR & regex rules',
      nexoraWin: true
    },
    {
      metric: 'Price Surge & Fraud Audit',
      icon: ShieldAlert,
      nexora: 'Automated Z-score & arithmetic verification',
      legacy: 'Manual sampling or basic regex',
      nexoraWin: true
    },
    {
      metric: 'Data Privacy & Retention',
      icon: Lock,
      nexora: 'Zero data retention + AES-Fernet encrypted key',
      legacy: 'Invoice data mined on vendor cloud',
      nexoraWin: true
    },
    {
      metric: 'Accounting Export Formats',
      icon: FileSpreadsheet,
      nexora: '3-sheet styled Excel, CSV ledger, PDF vouchers',
      legacy: 'Basic flat CSV or paid export add-on',
      nexoraWin: true
    }
  ];

  const faqs = [
    {
      icon: KeyRound,
      q: 'How does the Bring-Your-Own-Key (BYOK) model work?',
      a: 'Nexora is architected so that you supply your own Google Gemini API key from Google AI Studio. Google provides 1,500 requests per day on the free tier. Your key is symmetrically encrypted with AES-Fernet (AES-128 CBC + HMAC SHA256) and never shared.'
    },
    {
      icon: Lock,
      q: 'Is my company’s confidential invoice data stored or trained on?',
      a: 'No. Nexora operates with strict zero-retention principles. Your document scans are streamed directly via secure pre-signed Cloudflare R2 URLs. Google Gemini API keys configured through AI Studio do not use API data to train models.'
    },
    {
      icon: TrendingUp,
      q: 'How does the statistical Z-score price surge detection work?',
      a: 'Nexora stores historical unit pricing records per vendor SKU. When an invoice is processed, the unit price is evaluated against the historical distribution: Z = (unit_price - mean) / std_dev. Invoices with Z >= 2.5 sigma (+2.5 standard deviations) are immediately flagged for human review.'
    },
    {
      icon: FileSpreadsheet,
      q: 'What accounting formats and integrations are supported?',
      a: 'You can export at any time to styled 3-sheet Excel workbooks (.xlsx) with soft-red highlighting on flagged rows, standardized General Ledger CSVs ready for QuickBooks or Xero import, and printable PDF payment remittance vouchers.'
    },
    {
      icon: Zap,
      q: 'Can our organization use Nexora completely free of charge?',
      a: 'Yes. With the combined BYOK free-tier of Gemini 2.5 Flash, Cloudflare R2 zero-egress bucket storage, and Supabase free PostgreSQL community tier, you can process up to 1,500 invoices per day with zero software subscriptions.'
    }
  ];

  return (
    <div className="flex flex-col bg-background relative selection:bg-accent/20 selection:text-accent min-h-screen overflow-y-auto">
      
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-40"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_015952_e1deeb12-8fb7-4071-a42a-60779fc64ab6.mp4"
      />

      <div className="fixed inset-0 bg-background/30 backdrop-blur-[0.5px] z-0 pointer-events-none" />

      <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 lg:px-20 py-5 font-body shrink-0 border-b border-border/40 bg-background/40 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2.5 text-xl font-semibold tracking-tight text-foreground group">
          <div className="w-8 h-8 rounded-xl bg-background border border-border flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform overflow-hidden p-0.5">
            <img src="/logo.png" alt="Nexora Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-display font-bold">Nexora</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground font-medium">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
            className="hover:text-foreground transition-colors cursor-pointer"
          >
            Home
          </button>
          <button 
            onClick={() => scrollToSection('features')} 
            className="hover:text-foreground transition-colors cursor-pointer"
          >
            Capabilities
          </button>
          <button 
            onClick={() => scrollToSection('how-it-works')} 
            className="hover:text-foreground transition-colors cursor-pointer"
          >
            How to Use
          </button>
          <button 
            onClick={() => scrollToSection('calculator')} 
            className="hover:text-foreground transition-colors cursor-pointer"
          >
            ROI Calculator
          </button>
          <button 
            onClick={() => scrollToSection('pipeline')} 
            className="hover:text-foreground transition-colors cursor-pointer"
          >
            Pipeline
          </button>
          <button 
            onClick={() => scrollToSection('comparison')} 
            className="hover:text-foreground transition-colors cursor-pointer"
          >
            Vs Legacy
          </button>
          <button 
            onClick={() => scrollToSection('faq')} 
            className="hover:text-foreground transition-colors cursor-pointer"
          >
            FAQ
          </button>
          <Link 
            href="/staging" 
            className="text-accent hover:text-accent/80 transition-colors font-semibold flex items-center gap-1.5"
          >
            <span>ERP Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="https://github.com/OneforAll-Deku/Nexora-"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-border bg-background/80 hover:bg-secondary text-foreground transition-all shadow-sm group hover:border-accent/40 cursor-pointer"
            title="Star Nexora on GitHub"
          >
            <GithubIcon className="w-4 h-4 text-foreground group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">GitHub</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-accent/15 text-accent font-bold">★ OSS</span>
          </a>

          <Link href="/staging">
            <Button className="rounded-full px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-transform active:scale-95 flex items-center gap-1.5">
              <span>Launch App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </nav>

      <main className="relative z-10 flex flex-col items-center w-full px-4 pt-6 md:pt-10 shrink-0 pb-12">
        <div className="flex flex-col items-center w-full max-w-5xl">
          
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-3"
          >
            <a
              href="https://github.com/OneforAll-Deku/Nexora-"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/30 bg-accent/10 hover:bg-accent/15 text-foreground text-xs font-medium backdrop-blur-md transition-all hover:scale-105 cursor-pointer shadow-sm group"
            >
              <GithubIcon className="w-4 h-4 text-foreground group-hover:rotate-12 transition-transform" />
              <span className="font-semibold text-accent">100% Free &amp; Open Source</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-1">
                Star on GitHub <ArrowRight className="w-3 h-3 text-accent group-hover:translate-x-0.5 transition-transform" />
              </span>
            </a>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center font-display text-5xl md:text-6xl lg:text-[4.75rem] leading-[0.96] tracking-tight text-foreground max-w-3xl"
          >
            Enterprise AP Intelligence at <span className="italic font-normal text-accent">Zero Cost</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-5 text-center text-base md:text-lg text-muted-foreground max-w-[680px] leading-relaxed font-body"
          >
            Eliminate manual document entry and protect your bottom line. Bring your own Gemini API key for instant multimodal extraction, mathematical error auditing, and statistical price surge protection.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-3.5"
          >
            <Link href="/staging">
              <Button
                className="rounded-full px-7 py-5 text-sm font-semibold font-body bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transition-transform active:scale-95 flex items-center gap-2"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Start Ingesting Invoices</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <a
              href="https://github.com/OneforAll-Deku/Nexora-"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full px-6 py-5 text-sm font-medium font-body bg-background/80 border border-border hover:bg-secondary/60 text-foreground transition-all cursor-pointer flex items-center gap-2 shadow-sm group"
            >
              <GithubIcon className="w-4 h-4 text-foreground group-hover:scale-110 transition-transform" />
              <span>GitHub Repo</span>
            </a>

            <Button
              variant="outline"
              onClick={() => setActiveModal('demo')}
              className="rounded-full px-6 py-5 text-sm font-medium font-body bg-background/80 border border-border hover:bg-secondary/60 text-foreground transition-all cursor-pointer flex items-center gap-2 shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
              <span>Request Guided Tour</span>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-medium"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Zero-Data Retention</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" />
              <span>1,500 Free Daily Pages</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" />
              <span>&lt; 15s Cycle Velocity</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-teal-600" />
              <span>100% Free Forever Architecture</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-10 w-full max-w-5xl"
          >
            <div
              className="rounded-3xl overflow-hidden p-3 md:p-4 transition-all"
              style={{
                background: 'rgba(255, 255, 255, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                boxShadow: 'var(--shadow-dashboard)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
              }}
            >
              <div className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden text-[11px] flex flex-col font-body">
                
                <div className="h-12 border-b border-border px-4 flex items-center justify-between bg-background shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-background border border-border flex items-center justify-center overflow-hidden p-0.5 shadow-sm">
                      <img src="/logo.png" alt="Nexora Logo" className="w-full h-full object-contain" />
                    </div>
                    <span className="font-semibold text-foreground text-xs font-display">Nexora Enterprise ERP</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/15 text-accent font-semibold border border-accent/20 flex items-center gap-1">
                      <Cpu className="w-3 h-3" /> Live BYOK
                    </span>
                  </div>

                  <div className="hidden sm:flex items-center gap-2 bg-secondary/70 border border-border/80 px-3 py-1 rounded-full text-muted-foreground w-64">
                    <Search className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[10px]">Filter vendors, invoices, or flags...</span>
                    <kbd className="ml-auto text-[9px] bg-background px-1.5 py-0.5 rounded border border-border font-mono">⌘K</kbd>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link href="/staging">
                      <button className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-[10px] font-medium flex items-center gap-1.5 hover:bg-primary/90 transition-colors cursor-pointer">
                        <UploadCloud className="w-3 h-3" /> Ingest File
                      </button>
                    </Link>
                    <Bell className="w-3.5 h-3.5 text-muted-foreground" />
                    <div className="w-6 h-6 rounded-full bg-accent/20 text-accent font-bold flex items-center justify-center text-[10px] border border-accent/30">
                      AP
                    </div>
                  </div>
                </div>

                <div className="flex min-h-[380px]">
                  
                  <div className="w-44 border-r border-border bg-background/80 p-3 space-y-4 shrink-0 hidden sm:block">
                    <div className="space-y-1">
                      <button
                        onClick={() => setPreviewTab('overview')}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-all cursor-pointer ${
                          previewTab === 'overview'
                            ? 'bg-secondary text-foreground font-semibold shadow-sm'
                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Home className="w-3.5 h-3.5" />
                          <span>Overview</span>
                        </div>
                      </button>

                      <button
                        onClick={() => setPreviewTab('anomalies')}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-all cursor-pointer ${
                          previewTab === 'anomalies'
                            ? 'bg-secondary text-foreground font-semibold shadow-sm'
                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                          <span>Audit Hub</span>
                        </div>
                        <span className="text-[9px] bg-rose-500/15 text-rose-700 font-bold px-1.5 py-0.5 rounded-full border border-rose-500/20">3</span>
                      </button>

                      <button
                        onClick={() => setPreviewTab('invoices')}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-all cursor-pointer ${
                          previewTab === 'invoices'
                            ? 'bg-secondary text-foreground font-semibold shadow-sm'
                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <ReceiptText className="w-3.5 h-3.5" />
                          <span>Master Ledger</span>
                        </div>
                        <span className="text-[9px] bg-emerald-500/15 text-emerald-700 font-bold px-1.5 py-0.5 rounded-full border border-emerald-500/20">84</span>
                      </button>

                      <button
                        onClick={() => setPreviewTab('vault')}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-all cursor-pointer ${
                          previewTab === 'vault'
                            ? 'bg-secondary text-foreground font-semibold shadow-sm'
                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <KeyRound className="w-3.5 h-3.5 text-accent" />
                          <span>BYOK Vault</span>
                        </div>
                      </button>
                    </div>

                    <div className="pt-3 border-t border-border/60">
                      <span className="text-[9px] font-semibold text-muted-foreground uppercase px-2 tracking-wider">Verification Pipeline</span>
                      <div className="mt-1.5 space-y-1 text-muted-foreground">
                        <div className="px-2 py-1 rounded-md bg-accent/10 text-accent font-medium flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Multimodal Vision</span>
                        </div>
                        <div className="px-2 py-1 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Math Verification</span>
                        </div>
                        <div className="px-2 py-1 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Z-Score Anomaly</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 bg-secondary/30 p-4 space-y-3.5 overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
                      <div>
                        <h2 className="text-sm font-semibold text-foreground font-display">
                          {previewTab === 'overview' && 'Accounts Payable Overview'}
                          {previewTab === 'anomalies' && 'Price Surge & Fraud Audit Feed'}
                          {previewTab === 'invoices' && 'Verified General Ledger Feed'}
                          {previewTab === 'vault' && 'Cryptographic BYOK Security Vault'}
                        </h2>
                        <p className="text-[10px] text-muted-foreground">
                          {previewTab === 'overview' && 'Real-time reconciliation status and disbursement pipeline'}
                          {previewTab === 'anomalies' && 'Discrepancies flagged by automated statistical audit'}
                          {previewTab === 'invoices' && 'Committed records with dual-entry accounting accounts'}
                          {previewTab === 'vault' && 'AES-Fernet CBC client-side key storage and status'}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => setPreviewPeriod('30d')}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors cursor-pointer ${
                            previewPeriod === '30d' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-background border border-border text-muted-foreground'
                          }`}
                        >
                          Last 30 Days
                        </button>
                        <button 
                          onClick={() => setPreviewPeriod('7d')}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors cursor-pointer ${
                            previewPeriod === '7d' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-background border border-border text-muted-foreground'
                          }`}
                        >
                          7 Days
                        </button>
                      </div>
                    </div>

                    {previewTab === 'overview' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="bg-background rounded-xl border border-border p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span>Reconciled Outflow</span>
                                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center text-[8px] font-bold">✓</span>
                              </div>
                              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                100% Validated
                              </span>
                            </div>

                            <div className="flex items-baseline gap-1">
                              <span className="text-xl font-bold text-foreground font-mono">
                                {previewPeriod === '30d' ? '$248,150' : '$62,400'}
                              </span>
                              <span className="text-xs text-muted-foreground font-mono">.00</span>
                            </div>

                            <div className="flex items-center gap-3 text-[10px]">
                              <span className="text-muted-foreground">Audited Invoices:</span>
                              <span className="text-foreground font-bold font-mono">{previewPeriod === '30d' ? '84' : '22'}</span>
                              <span className="text-muted-foreground ml-auto">Surges Blocked:</span>
                              <span className="text-rose-600 font-bold font-mono">-$14,280</span>
                            </div>

                            <div className="h-16 w-full pt-1">
                              <svg viewBox="0 0 400 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                <defs>
                                  <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.25" />
                                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.0" />
                                  </linearGradient>
                                </defs>
                                <path
                                  d="M 0,70 C 50,60 100,80 160,45 C 220,10 270,40 330,20 C 365,10 385,15 400,8 L 400,100 L 0,100 Z"
                                  fill="url(#areaGrad)"
                                />
                                <path
                                  d="M 0,70 C 50,60 100,80 160,45 C 220,10 270,40 330,20 C 365,10 385,15 400,8"
                                  fill="none"
                                  stroke="hsl(var(--accent))"
                                  strokeWidth="1.75"
                                />
                              </svg>
                            </div>
                          </div>

                          <div className="bg-background rounded-xl border border-border p-3 flex flex-col justify-between">
                            <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
                              <span className="text-xs font-semibold text-foreground">Disbursement Queues</span>
                              <span className="text-[10px] text-muted-foreground font-mono">Real-time</span>
                            </div>

                            <div className="space-y-1.5 text-xs py-1">
                              <div className="flex items-center justify-between py-1 border-b border-border/40">
                                <div className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                  <span className="text-muted-foreground font-medium">Ready for Ledger</span>
                                </div>
                                <span className="font-mono font-semibold text-emerald-600">81 files</span>
                              </div>

                              <div className="flex items-center justify-between py-1 border-b border-border/40">
                                <div className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                                  <span className="text-muted-foreground font-medium">Flagged &amp; Held</span>
                                </div>
                                <span className="font-mono font-semibold text-rose-600">3 files</span>
                              </div>

                              <div className="flex items-center justify-between py-1">
                                <div className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-accent" />
                                  <span className="text-muted-foreground font-medium">Gemini Daily Quota</span>
                                </div>
                                <span className="font-mono font-semibold text-foreground">1,416 / 1,500 left</span>
                              </div>
                            </div>

                            <Link href="/staging" className="pt-2 block">
                              <button className="w-full py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-[10px] border border-border transition-colors cursor-pointer flex items-center justify-center gap-1">
                                <span>Open Full Queue</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </Link>
                          </div>
                        </div>

                        <div className="bg-background rounded-xl border border-border p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xs font-semibold text-foreground">Recent Ingestion Stream</h3>
                            <Link href="/ledger" className="text-[10px] text-accent hover:underline flex items-center gap-0.5">
                              <span>View All In Ledger</span>
                              <ChevronRight className="w-3 h-3" />
                            </Link>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-[11px]">
                              <thead>
                                <tr className="text-muted-foreground border-b border-border/60 text-[10px]">
                                  <th className="pb-1 font-medium">Vendor</th>
                                  <th className="pb-1 font-medium">Invoice #</th>
                                  <th className="pb-1 font-medium text-right">Total</th>
                                  <th className="pb-1 font-medium text-right">Audit Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border/40 font-mono text-[10px]">
                                <tr>
                                  <td className="py-1.5 font-sans font-medium text-foreground">Apex Cloud Systems</td>
                                  <td className="py-1.5 text-muted-foreground">INV-2026-904</td>
                                  <td className="py-1.5 text-right font-bold text-foreground">$5,262.25</td>
                                  <td className="py-1.5 text-right font-sans">
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 font-semibold border border-emerald-500/20">
                                      Clean / Reconciled
                                    </span>
                                  </td>
                                </tr>
                                <tr>
                                  <td className="py-1.5 font-sans font-medium text-foreground">FastShip Logistics</td>
                                  <td className="py-1.5 text-muted-foreground">FSL-89022</td>
                                  <td className="py-1.5 text-right font-bold text-rose-600">$1,890.00</td>
                                  <td className="py-1.5 text-right font-sans">
                                    <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-700 font-semibold border border-rose-500/20">
                                      Math Mismatch (+$120.00)
                                    </span>
                                  </td>
                                </tr>
                                <tr>
                                  <td className="py-1.5 font-sans font-medium text-foreground">Industrial Machine Co.</td>
                                  <td className="py-1.5 text-muted-foreground">IMC-4491</td>
                                  <td className="py-1.5 text-right font-bold text-amber-600">$14,500.00</td>
                                  <td className="py-1.5 text-right font-sans">
                                    <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 font-semibold border border-amber-500/20">
                                      Unit Surge (+42%)
                                    </span>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {previewTab === 'anomalies' && (
                      <div className="space-y-3">
                        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-700 flex items-center justify-center shrink-0">
                            <ShieldAlert className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-rose-700 font-display">Statistical Anomaly &amp; Fraud Alerts</h4>
                            <p className="text-[10px] text-rose-600/90 leading-relaxed mt-0.5">
                              The deterministic audit engine intercepted 3 anomalies before disbursement authorization.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="bg-background rounded-xl border border-border p-3 flex items-center justify-between">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-xs text-foreground">FastShip Logistics</span>
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-700 font-mono font-bold">FSL-89022</span>
                              </div>
                              <p className="text-[10px] text-muted-foreground">Line item sum ($1,770.00) does not match stated invoice total ($1,890.00).</p>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-bold font-mono text-rose-600">Diff: +$120.00</span>
                              <p className="text-[9px] text-rose-600 font-semibold">Payment Blocked</p>
                            </div>
                          </div>

                          <div className="bg-background rounded-xl border border-border p-3 flex items-center justify-between">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-xs text-foreground">Apex Hardware Depot</span>
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 font-mono font-bold">AHD-109</span>
                              </div>
                              <p className="text-[10px] text-muted-foreground">Unit price for SKU-881 ($195.00) is +62% above historical mean (Z = 2.84σ).</p>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-bold font-mono text-amber-600">+62.5% Surge</span>
                              <p className="text-[9px] text-amber-600 font-semibold">Audit Required</p>
                            </div>
                          </div>
                        </div>

                        <Link href="/anomalies" className="block pt-1">
                          <button className="w-full py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-all cursor-pointer">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Investigate In Anomalies Command Center</span>
                          </button>
                        </Link>
                      </div>
                    )}

                    {previewTab === 'invoices' && (
                      <div className="space-y-3">
                        <div className="bg-background rounded-xl border border-border p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground">Committed Master Ledger Entries</span>
                            <span className="text-[10px] text-muted-foreground">Showing latest 3 of 84 records</span>
                          </div>
                          <div className="space-y-2 font-mono text-[10px]">
                            <div className="p-2.5 rounded-lg bg-secondary/50 border border-border/60 flex items-center justify-between">
                              <div>
                                <span className="font-sans font-semibold text-foreground text-xs">Apex Cloud Systems</span>
                                <p className="text-muted-foreground text-[9px]">INV-2026-904 • Subtotal: $4,850.00 • Tax: $412.25</p>
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-foreground text-xs">$5,262.25</span>
                                <p className="text-emerald-600 font-sans text-[9px] font-semibold">Committed to GL</p>
                              </div>
                            </div>

                            <div className="p-2.5 rounded-lg bg-secondary/50 border border-border/60 flex items-center justify-between">
                              <div>
                                <span className="font-sans font-semibold text-foreground text-xs">Global Fiber Networks</span>
                                <p className="text-muted-foreground text-[9px]">GFN-7718 • Subtotal: $1,200.00 • Tax: $96.00</p>
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-foreground text-xs">$1,296.00</span>
                                <p className="text-emerald-600 font-sans text-[9px] font-semibold">Committed to GL</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Link href="/ledger" className="block pt-1">
                          <button className="w-full py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-all cursor-pointer">
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                            <span>Export 3-Sheet Excel Ledger &amp; CSVs</span>
                          </button>
                        </Link>
                      </div>
                    )}

                    {previewTab === 'vault' && (
                      <div className="space-y-3">
                        <div className="bg-background rounded-xl border border-border p-4 space-y-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center">
                              <Lock className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-foreground font-display">AES-Fernet Cryptographic Key Vault</h4>
                              <p className="text-[10px] text-muted-foreground">Client-side encryption for your Google Gemini API key</p>
                            </div>
                          </div>

                          <div className="p-3 rounded-lg bg-secondary/60 border border-border text-xs space-y-1.5 font-mono text-[10px]">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground font-sans">Active Key Mask:</span>
                              <span className="font-bold text-foreground">AIzaSy...789X</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground font-sans">Cipher Protocol:</span>
                              <span className="text-accent font-semibold">AES-128-CBC + HMAC-SHA256</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground font-sans">Storage Target:</span>
                              <span className="text-emerald-600 font-semibold">Encrypted DB Record (Zero Plaintext)</span>
                            </div>
                          </div>
                        </div>

                        <Link href="/settings" className="block pt-1">
                          <button className="w-full py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-all cursor-pointer">
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>Configure or Rotate Gemini BYOK Key</span>
                          </button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="pt-8 text-center relative z-20">
          <button
            onClick={() => scrollToSection('features')}
            className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground font-medium bg-background/90 border border-border px-5 py-2.5 rounded-full shadow-sm backdrop-blur-md transition-all hover:scale-105 cursor-pointer"
          >
            <span>Explore Autonomous Intelligence Architecture</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </main>

      <div id="features" className="relative z-10 bg-background/95 border-t border-border/80 px-6 md:px-12 lg:px-20 py-20 space-y-28">
        
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-accent flex items-center justify-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>Core Operational Benchmark</span>
            </span>
            <h2 className="font-display text-3xl md:text-4xl text-foreground font-bold">
              Autonomous Intelligence Operating Metrics
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Engineered for zero-overhead accounts payable automation without per-document SaaS penalties.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl bg-secondary/40 border border-border shadow-sm hover:border-accent/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Daily Processing Quota</span>
                <div className="w-9 h-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-3xl font-black text-foreground font-mono">1,500</p>
                <div className="text-[11px] text-accent mt-1 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Free Requests/Day (Gemini)</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-secondary/40 border border-border shadow-sm hover:border-purple-500/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Average Review Cycle</span>
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-3xl font-black text-purple-600 font-mono">&lt; 15s</p>
                <div className="text-[11px] text-purple-600 mt-1 flex items-center gap-1 font-medium">
                  <TrendingUp className="w-3 h-3" />
                  <span>94% faster than manual AP</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-secondary/40 border border-border shadow-sm hover:border-emerald-500/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Audit Catch Rate</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Percent className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-3xl font-black text-emerald-600 font-mono">100%</p>
                <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Arithmetic &amp; Duplicate Guard</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-secondary/40 border border-border shadow-sm hover:border-teal-500/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Software Overhead</span>
                <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-3xl font-black text-foreground font-mono">$0.00</p>
                <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1 font-medium">
                  <span>Zero seat fees, zero markups</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="calculator" className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-accent flex items-center justify-center gap-1.5">
              <Calculator className="w-3.5 h-3.5" />
              <span>Interactive AP ROI Calculator</span>
            </span>
            <h2 className="font-display text-3xl md:text-4xl text-foreground font-bold">
              Quantify Your Monthly Cost &amp; Hour Savings
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Slide to your monthly invoice processing volume to see how Nexora eliminates SaaS license bloat.
            </p>
          </div>

          <div className="p-8 md:p-10 rounded-3xl bg-secondary/30 border border-border shadow-sm space-y-8">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Monthly Invoices Processed</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-black font-mono text-foreground">{calculatorVolume.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground font-medium">invoices / month</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {[100, 500, 1500, 3000].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setCalculatorVolume(preset)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        calculatorVolume === preset
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-background border border-border text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {preset >= 1000 ? `${preset / 1000}k` : preset}
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="range"
                min="50"
                max="5000"
                step="50"
                value={calculatorVolume}
                onChange={(e) => setCalculatorVolume(Number(e.target.value))}
                className="w-full h-2.5 bg-background rounded-lg appearance-none cursor-pointer accent-accent border border-border"
              />
              <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                <span>50 invoices</span>
                <span>1,500 invoices</span>
                <span>3,000 invoices</span>
                <span>5,000 invoices</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-border">
              <div className="bg-background rounded-2xl p-5 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">Manual Hours Saved</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold font-mono text-foreground">{hoursSaved} hrs / mo</p>
                <p className="text-[11px] text-purple-600 font-medium">Reallocated to core finance</p>
              </div>

              <div className="bg-background rounded-2xl p-5 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">Legacy IDP Cost Avoided</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold font-mono text-emerald-600">${legacyCost.toLocaleString()} / mo</p>
                <p className="text-[11px] text-muted-foreground font-medium">vs $0.00 with Nexora</p>
              </div>

              <div className="bg-background rounded-2xl p-5 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">Discrepancies Caught</span>
                  <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold font-mono text-rose-600">{anomaliesPrevented} / mo</p>
                <p className="text-[11px] text-rose-600 font-medium">Price surges &amp; math errors</p>
              </div>

              <div className="bg-background rounded-2xl p-5 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">Nexora Software Fee</span>
                  <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold font-mono text-teal-600">$0.00 / mo</p>
                <p className="text-[11px] text-muted-foreground font-medium">BYOK free-tier ecosystem</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Calculations based on 15m manual entry/invoice and legacy $0.35/page + $500 seat rates.</span>
              </div>

              <Link href="/staging">
                <Button className="rounded-full px-6 py-2.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2">
                  <span>Test Your Invoices In The ERP</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 100% OPEN SOURCE & HOW TO USE SECTION */}
        <div id="how-it-works" className="max-w-5xl mx-auto space-y-10 scroll-mt-24">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent/10 border border-accent/25 text-accent text-xs font-bold uppercase tracking-wider">
              <GithubIcon className="w-3.5 h-3.5" />
              <span>100% Open Source • Step-by-Step Guide</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground font-bold">
              How to Use Nexora &amp; Self-Host for Free
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              No subscription barriers, zero vendor lock-in. Nexora is open-source under the MIT license with a Bring-Your-Own-Key (BYOK) architecture that leverages generous free-tier APIs.
            </p>
          </div>

          {/* 3 Step Interactive Walkthrough */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-3xl bg-secondary/40 border border-border hover:border-accent/40 transition-all space-y-4 relative group">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-accent/15 text-accent flex items-center justify-center font-display text-xl font-bold">
                  01
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                  BYOK Setup
                </span>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-foreground font-display">1. Connect Your Free Key</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Open the <strong>BYOK Vault</strong> and enter your Google AI Studio Gemini API key or OpenRouter key. Enjoy <strong>1,500 free daily multimodal requests</strong>. Keys are AES-Fernet encrypted client-side.
                </p>
              </div>
              <div className="pt-2 flex items-center gap-2 text-xs text-accent font-medium">
                <KeyRound className="w-3.5 h-3.5" />
                <Link href="/settings" className="hover:underline flex items-center gap-1 font-semibold">
                  <span>Open BYOK Vault</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-secondary/40 border border-border hover:border-teal-500/40 transition-all space-y-4 relative group">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-teal-500/15 text-teal-600 flex items-center justify-center font-display text-xl font-bold">
                  02
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-600 border border-teal-500/20">
                  Zero-Egress
                </span>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-foreground font-display">2. Drop Invoices &amp; Receipts</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Drag and drop single or multiple PDF documents, smartphone camera receipts, or distorted scans. Files stream to Cloudflare R2 with <strong>zero egress bandwidth fees</strong> and instant vision token extraction.
                </p>
              </div>
              <div className="pt-2 flex items-center gap-2 text-xs text-teal-600 font-medium">
                <UploadCloud className="w-3.5 h-3.5" />
                <Link href="/staging" className="hover:underline flex items-center gap-1 font-semibold">
                  <span>Ingestion Workspace</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-secondary/40 border border-border hover:border-purple-500/40 transition-all space-y-4 relative group">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-purple-500/15 text-purple-600 flex items-center justify-center font-display text-xl font-bold">
                  03
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/20">
                  Audit &amp; Export
                </span>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-foreground font-display">3. Audit &amp; 1-Click Export</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Automated arithmetic checks verify every line item while statistical Z-scores flag price spikes. Once verified, export immediately to styled <strong>3-sheet Excel workbooks</strong>, CSV ledgers, and PDF vouchers.
                </p>
              </div>
              <div className="pt-2 flex items-center gap-2 text-xs text-purple-600 font-medium">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <Link href="/ledger" className="hover:underline flex items-center gap-1 font-semibold">
                  <span>General Ledger</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Open Source Hub Banner with GitHub Details */}
          <div className="p-7 md:p-9 rounded-3xl bg-secondary/30 border border-border shadow-sm space-y-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 pb-6 border-b border-border">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-13 h-13 rounded-2xl bg-foreground text-background flex items-center justify-center shrink-0 shadow-md p-3">
                  <GithubIcon className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-bold text-foreground font-display">OneforAll-Deku/Nexora-</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 font-bold border border-emerald-500/20">
                      MIT License
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent/15 text-accent font-bold border border-accent/20">
                      100% Open Source
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Enterprise AP &amp; Document Intelligence ERP • Python FastAPI Core + Next.js 15
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="https://github.com/OneforAll-Deku/Nexora-"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-full bg-foreground text-background hover:bg-foreground/90 text-xs font-semibold flex items-center gap-2 shadow-sm transition-all hover:scale-105 cursor-pointer"
                >
                  <GithubIcon className="w-4 h-4" />
                  <span>Star on GitHub</span>
                </a>
                <a
                  href="https://github.com/OneforAll-Deku/Nexora-"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-full bg-background border border-border hover:bg-secondary text-foreground text-xs font-semibold flex items-center gap-2 shadow-sm transition-all hover:border-accent/40 cursor-pointer"
                >
                  <span>View Repository</span>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                </a>
              </div>
            </div>

            {/* Terminal Clone Block & Open Source Pillars */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Quickstart: Clone &amp; Run Locally</span>
                  </span>
                  <button
                    onClick={handleCopyClone}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-background border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedClone ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <span className="font-mono">📋 Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-background rounded-2xl border border-border p-4 font-mono text-[11px] text-muted-foreground space-y-1.5 shadow-inner overflow-x-auto">
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground/70 pb-1 border-b border-border/60">
                    <span className="w-2 rounded-full h-2 bg-rose-500/70" />
                    <span className="w-2 rounded-full h-2 bg-amber-500/70" />
                    <span className="w-2 rounded-full h-2 bg-emerald-500/70" />
                    <span className="ml-1 text-muted-foreground font-sans">bash / powershell</span>
                  </div>
                  <p className="text-foreground"><span className="text-accent select-none">$ </span>git clone https://github.com/OneforAll-Deku/Nexora-.git</p>
                  <p className="text-foreground"><span className="text-accent select-none">$ </span>cd Nexora-</p>
                  <p className="text-foreground"><span className="text-accent select-none">$ </span>pip install -r backend/requirements.txt</p>
                  <p className="text-foreground"><span className="text-accent select-none">$ </span>npm --prefix frontend install &amp;&amp; npm --prefix frontend run dev</p>
                </div>
              </div>

              <div className="space-y-2.5">
                <span className="text-xs font-semibold text-foreground flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Why Open Source Accounts Payable Matters</span>
                </span>

                <div className="space-y-2.5 text-xs text-muted-foreground">
                  <div className="p-3 rounded-xl bg-background border border-border space-y-1">
                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Zero Vendor Markups</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Unlike commercial IDPs charging $500/seat and $0.40/page, you pay $0. Deploy on free Vercel, Supabase, and Cloudflare R2 tiers.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-background border border-border space-y-1">
                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Zero-Retention Financial Privacy</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Your vendor banking details, amounts, and tax IDs never train third-party models and are protected by AES-Fernet encrypted keys.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="pipeline" className="max-w-5xl mx-auto space-y-8 scroll-mt-24">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-accent flex items-center justify-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>End-to-End Workflow</span>
              </span>
              <a
                href="https://github.com/OneforAll-Deku/Nexora-"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors ml-2"
                title="Inspect Pipeline on GitHub"
              >
                <GithubIcon className="w-3 h-3" />
                <span>Source Code</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <h2 className="font-display text-3xl md:text-4xl text-foreground font-bold">
              The 4-Stage Autonomous Pipeline Explorer
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Click through each pipeline stage to inspect how multimodal vision, math checks, and Z-score statistics work together.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {pipelineStages.map((stage) => {
              const Icon = stage.icon;
              const isActive = activePipelineStage === stage.id;
              return (
                <button
                  key={stage.id}
                  onClick={() => setActivePipelineStage(stage.id)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-accent/10 border-accent/40 shadow-sm'
                      : 'bg-secondary/40 border-border hover:bg-secondary/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      isActive ? 'bg-accent text-accent-foreground' : 'bg-secondary text-foreground'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold font-mono text-muted-foreground">0{stage.id + 1}</span>
                  </div>
                  <h4 className={`text-xs font-bold ${isActive ? 'text-accent' : 'text-foreground'}`}>
                    {stage.title}
                  </h4>
                  <span className="text-[10px] text-muted-foreground">{stage.badge}</span>
                </button>
              );
            })}
          </div>

          <div className="p-8 rounded-3xl bg-secondary/30 border border-border shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-bold border border-accent/25">
                  <span>Stage 0{pipelineStages[activePipelineStage].id + 1}: {pipelineStages[activePipelineStage].badge}</span>
                </div>
                <h3 className="text-2xl font-bold font-display text-foreground">
                  {pipelineStages[activePipelineStage].title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {pipelineStages[activePipelineStage].details}
                </p>

                <div className="space-y-2.5 pt-2">
                  {pipelineStages[activePipelineStage].bullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-foreground font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3">
                  <Link href="/staging">
                    <button className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all flex items-center gap-2 cursor-pointer shadow-sm">
                      <span>Launch Ingestion Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                </div>
              </div>

              <div className="bg-background rounded-2xl border border-border p-5 shadow-sm space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-border/80">
                  <span className="text-[11px] font-sans font-semibold text-muted-foreground">Execution Artifact Preview</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-secondary text-foreground border border-border">
                    Stage Verified
                  </span>
                </div>
                <pre className="text-[11px] text-muted-foreground p-3.5 rounded-xl bg-secondary/40 border border-border overflow-x-auto leading-relaxed">
                  <code>{pipelineStages[activePipelineStage].codePreview}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>

        <div id="comparison" className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-accent flex items-center justify-center gap-1.5">
              <Scale className="w-3.5 h-3.5" />
              <span>Architectural Showdown</span>
            </span>
            <h2 className="font-display text-3xl md:text-4xl text-foreground font-bold">
              Legacy IDP Vendors vs. Nexora BYOK
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Compare traditional per-seat, per-page document processors against our permanent free-tier enterprise architecture.
            </p>
          </div>

          <div className="rounded-3xl border border-border overflow-hidden bg-background shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-secondary/40 text-muted-foreground font-semibold">
                    <th className="p-4 md:p-5">Platform Dimension</th>
                    <th className="p-4 md:p-5 text-accent font-bold">Nexora Enterprise BYOK</th>
                    <th className="p-4 md:p-5 text-muted-foreground">Legacy IDP Platforms (Rossum, Vic.ai)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {comparisonItems.map((item, idx) => {
                    const ItemIcon = item.icon;
                    return (
                      <tr key={idx} className="hover:bg-secondary/20 transition-colors">
                        <td className="p-4 md:p-5">
                          <div className="flex items-center gap-2.5 font-semibold text-foreground">
                            <ItemIcon className="w-4 h-4 text-accent" />
                            <span>{item.metric}</span>
                          </div>
                        </td>
                        <td className="p-4 md:p-5">
                          <div className="flex items-center gap-2 text-emerald-600 font-semibold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{item.nexora}</span>
                          </div>
                        </td>
                        <td className="p-4 md:p-5">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <X className="w-4 h-4 text-rose-500 shrink-0" />
                            <span>{item.legacy}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div id="faq" className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-accent flex items-center justify-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Questions &amp; Technical Answers</span>
            </span>
            <h2 className="font-display text-3xl md:text-4xl text-foreground font-bold">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Everything you need to know regarding zero data retention, BYOK encryption, and deployment.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const FaqIcon = faq.icon;
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-border bg-background shadow-sm overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 flex items-center justify-between text-left hover:bg-secondary/40 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 pr-4">
                      <div className="w-8 h-8 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                        <FaqIcon className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-foreground text-sm">{faq.q}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`} />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-1 text-xs text-muted-foreground leading-relaxed pl-16">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        <div className="max-w-4xl mx-auto rounded-3xl bg-foreground text-background p-10 md:p-14 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-3 max-w-xl mx-auto">
            <h2 className="font-display text-4xl md:text-5xl font-bold">Ready to modernize your accounts payable?</h2>
            <p className="text-sm text-background/80 leading-relaxed">
              Start extracting invoices, auditing arithmetic, and catching price surges immediately with zero monthly license fees.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap justify-center gap-4 pt-2">
            <Link href="/staging">
              <Button className="rounded-full px-7 py-5 bg-background text-foreground hover:bg-background/90 font-bold text-sm shadow-md flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-accent" />
                <span>Launch ERP Console</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <button
              onClick={() => setActiveModal('demo')}
              className="rounded-full px-6 py-2.5 border border-background/40 text-background bg-transparent hover:bg-background/15 font-bold text-sm transition-colors cursor-pointer flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Schedule Walkthrough</span>
            </button>
          </div>
        </div>

        <footer className="border-t border-border pt-10 pb-6 text-xs text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-background border border-border flex items-center justify-center overflow-hidden p-0.5 shadow-sm">
              <img src="/logo.png" alt="Nexora Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-foreground font-bold font-display text-sm">Nexora</span>
            <span>• Intelligent Document ERP (BYOK Edition)</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a
              href="https://github.com/OneforAll-Deku/Nexora-"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground text-foreground transition-colors flex items-center gap-1.5 font-semibold"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>GitHub (OneforAll-Deku/Nexora-)</span>
            </a>
            <Link href="/staging" className="hover:text-foreground transition-colors flex items-center gap-1">
              <UploadCloud className="w-3 h-3 text-accent" />
              <span>Batch Ingestion</span>
            </Link>
            <Link href="/ledger" className="hover:text-foreground transition-colors flex items-center gap-1">
              <ReceiptText className="w-3 h-3" />
              <span>General Ledger</span>
            </Link>
            <Link href="/anomalies" className="hover:text-foreground transition-colors flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-rose-600" />
              <span>Price Surge Hub</span>
            </Link>
            <Link href="/settings" className="hover:text-foreground transition-colors flex items-center gap-1">
              <KeyRound className="w-3 h-3 text-accent" />
              <span>BYOK Vault</span>
            </Link>
          </div>

          <p>© 2026 Nexora. Permanent Free-Tier Architecture.</p>
        </footer>
      </div>

      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-background border border-border rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 relative font-body"
            >
              <button
                onClick={() => setActiveModal(null)}
                className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {activeModal === 'video' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-accent" />
                    <h3 className="text-base font-bold text-foreground">Nexora Platform Walkthrough</h3>
                  </div>
                  <div className="rounded-2xl overflow-hidden aspect-video bg-black relative">
                    <video
                      controls
                      autoPlay
                      className="w-full h-full object-cover"
                      src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_015952_e1deeb12-8fb7-4071-a42a-60779fc64ab6.mp4"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Discover how autonomous multimodal OCR and statistical Z-score auditing eliminate manual document entry.
                  </p>
                </div>
              )}

              {activeModal === 'demo' && (
                <div>
                  {demoSubmitted ? (
                    <div className="py-8 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h3 className="text-base font-bold text-foreground">Demo Scheduled!</h3>
                      <p className="text-xs text-muted-foreground">Our solutions team will connect with you within 24 hours.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleDemoSubmit} className="space-y-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-foreground">Book a Personalized Demo</h3>
                          <p className="text-xs text-muted-foreground">Explore how Nexora automates invoices for your finance team.</p>
                        </div>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="block text-foreground font-semibold mb-1">Full Name</label>
                          <input
                            required
                            type="text"
                            value={demoForm.name}
                            onChange={(e) => setDemoForm({ ...demoForm, name: e.target.value })}
                            placeholder="Jane Doe"
                            className="w-full bg-secondary/50 border border-border rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-accent"
                          />
                        </div>

                        <div>
                          <label className="block text-foreground font-semibold mb-1">Work Email</label>
                          <input
                            required
                            type="email"
                            value={demoForm.email}
                            onChange={(e) => setDemoForm({ ...demoForm, email: e.target.value })}
                            placeholder="jane@company.com"
                            className="w-full bg-secondary/50 border border-border rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-accent"
                          />
                        </div>

                        <div>
                          <label className="block text-foreground font-semibold mb-1">Monthly Document Volume</label>
                          <select
                            value={demoForm.volume}
                            onChange={(e) => setDemoForm({ ...demoForm, volume: e.target.value })}
                            className="w-full bg-secondary/50 border border-border rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-accent"
                          >
                            <option value="1-50">1 - 50 invoices / mo</option>
                            <option value="50-200">50 - 200 invoices / mo</option>
                            <option value="200-1000">200 - 1,000 invoices / mo</option>
                            <option value="1000+">1,000+ invoices / mo</option>
                          </select>
                        </div>
                      </div>

                      <Button type="submit" className="w-full rounded-xl py-2.5 text-xs font-bold bg-primary text-primary-foreground flex items-center justify-center gap-2">
                        <span>Confirm Demo Request</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </form>
                  )}
                </div>
              )}

              {activeModal === 'pricing' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-accent">Zero-Cost Tier</span>
                      <h3 className="text-xl font-bold text-foreground font-display">Permanent $0/Month Architecture</h3>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-secondary/60 border border-border space-y-2 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Nexora BYOK Platform:</span>
                      </span>
                      <span className="text-emerald-600 font-bold">$0.00 / month</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Google AI Studio Inference:</span>
                      <span className="font-mono">1,500 free req/day</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Cloudflare R2 Egress:</span>
                      <span className="font-mono">$0 (Zero Egress Fees)</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Supabase PostgreSQL:</span>
                      <span className="font-mono">Free Community Tier</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-border/80 text-xs space-y-1">
                    <span className="font-semibold text-muted-foreground uppercase text-[10px]">Legacy IDP Platforms</span>
                    <p className="text-muted-foreground">
                      Competitors charge <strong className="text-foreground">$500/seat/mo</strong> plus <strong className="text-foreground">$0.30 per extracted page</strong>. Nexora costs $0.
                    </p>
                  </div>

                  <Link href="/staging" className="block pt-2">
                    <Button className="w-full rounded-xl text-xs font-bold bg-primary text-primary-foreground flex items-center justify-center gap-2">
                      <span>Start Ingesting For Free</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              )}

              {activeModal === 'about' && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-background border border-border flex items-center justify-center overflow-hidden p-1 shadow-sm">
                      <img src="/logo.png" alt="Nexora Logo" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground font-display">About Nexora Intelligent ERP</h3>
                      <p className="text-muted-foreground text-[10px]">BYOK Enterprise Document Architecture</p>
                    </div>
                  </div>

                  <p className="text-muted-foreground leading-relaxed">
                    Nexora is an enterprise-grade accounts payable and document intelligence platform designed to eliminate manual data entry errors and catch fraud before payment disbursement.
                  </p>

                  <div className="space-y-2 p-3.5 rounded-2xl bg-secondary/50 border border-border">
                    <div className="flex items-center gap-2 font-semibold text-foreground">
                      <Lock className="w-4 h-4 text-accent" />
                      <span>AES-Fernet Cryptographic Key Storage</span>
                    </div>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                      Your Gemini API key is encrypted symmetrically with AES-128 in CBC mode and HMAC SHA256 before storage, guaranteeing zero plaintext exposure.
                    </p>
                  </div>

                  <div className="pt-2">
                    <Button onClick={() => setActiveModal(null)} className="w-full rounded-xl text-xs bg-primary text-primary-foreground">
                      Got it
                    </Button>
                  </div>
                </div>
              )}

              {activeModal === 'contact' && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground font-display">Contact Engineering &amp; Support</h3>
                      <p className="text-muted-foreground text-[10px]">Have questions regarding custom integrations or ERP deployment?</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Your inquiry or question..."
                      className="w-full bg-secondary/50 border border-border rounded-xl p-3 text-foreground focus:outline-none focus:border-accent"
                    />
                    <Button
                      onClick={() => {
                        alert('Message sent! Our support engineers will respond shortly.');
                        setActiveModal(null);
                      }}
                      className="w-full rounded-xl text-xs font-bold bg-primary text-primary-foreground flex items-center justify-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Message</span>
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}