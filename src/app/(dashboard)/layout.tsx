'use client';

import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-content">
        <div className="content-wrapper">
          {children}
        </div>
      </div>
    </div>
  );
}
