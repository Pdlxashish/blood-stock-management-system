'use client';

import { PublicDashboardNav } from '@/components/PublicDashboardNav';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';

export default function PublicDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <PublicDashboardNav />

      <SidebarInset>
        {/* ── Top header bar (Sticky) ──────────────────────────────────────── */}
        <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 border-b px-4 bg-white shadow-sm">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <span className="text-sm font-medium text-muted-foreground">
            Blood Donation Public Portal
          </span>
        </header>

        {/* ── Page content ────────────────────────────────────────── */}
        <div className="flex flex-1 flex-col gap-4 p-6 md:p-8 bg-[#fafafc] min-h-screen">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
