'use client';

import { useRouter } from 'next/navigation';

interface Tab {
  id: string;
  label: string;
  icon?: string;
  badge?: string | number;
  badgeColor?: string;
  href?: string;
}

interface ModuleTabsProps {
  tabs: Tab[];
  activeId: string;
}

export default function ModuleTabs({ tabs, activeId }: ModuleTabsProps) {
  const router = useRouter();

  return (
    <div className="dash-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`dash-tab ${tab.id === activeId ? 'active' : ''}`}
          onClick={() => { if (tab.href) router.push(tab.href); }}
        >
          {tab.icon} {tab.label}
          {tab.badge !== undefined && (
            <span
              className="dash-tab-badge"
              style={tab.badgeColor ? { background: tab.badgeColor } : undefined}
            >
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
