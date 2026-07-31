import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '../providers/AppProvider';
import { DashboardShell } from '../components/layout/DashboardShell';

export const metadata: Metadata = {
  title: 'Unified Workspace Platform',
  description: 'Enterprise Multi-Tenant SaaS Workspace (Support Hub + Review & Audit Console)',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full bg-slate-950 text-slate-100">
      <body className="min-h-full flex flex-col font-sans antialiased">
        <AppProvider>
          <DashboardShell>{children}</DashboardShell>
        </AppProvider>
      </body>
    </html>
  );
}
