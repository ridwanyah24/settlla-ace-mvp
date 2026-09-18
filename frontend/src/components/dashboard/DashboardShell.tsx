"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { Home, Building2, User, LogOut } from "lucide-react";

export type DashboardAccent = "tenant" | "agent";

export interface DashboardTabItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface DashboardShellProps {
  accent: DashboardAccent;
  hubBadge: string;
  hubSubtitle: string;
  currentNavLabel: string;
  feedLinkLabel?: string;
  userTitle: string;
  userSubtitle: string;
  pageTitle: string;
  pageDescription?: string;
  pageMeta?: React.ReactNode;
  pageAction?: React.ReactNode;
  tabs: DashboardTabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  onSwitchRole: () => void;
  switchRoleLabel: string;
  onSignOut: () => void;
  mobileNavActiveLabel: string;
  children: React.ReactNode;
}

export function DashboardShell({
  accent,
  hubBadge,
  hubSubtitle,
  currentNavLabel,
  feedLinkLabel = "Browse properties",
  userTitle,
  userSubtitle,
  pageTitle,
  pageDescription,
  pageMeta,
  pageAction,
  tabs,
  activeTab,
  onTabChange,
  onSwitchRole,
  switchRoleLabel,
  onSignOut,
  mobileNavActiveLabel,
  children,
}: DashboardShellProps) {
  const isAgent = accent === "agent";
  const HubIcon = isAgent ? Building2 : Home;

  return (
    <div
      className="dashboard-shell min-h-screen flex flex-col has-mobile-nav bg-[var(--background)]"
      data-accent={accent}
    >
      <header className="dashboard-header sticky top-0 z-40 border-b border-[var(--settlla-border)] bg-white/95 backdrop-blur-sm">
        <div className="settlla-container flex min-w-0 items-center justify-between gap-2 py-2.5 sm:gap-4 sm:py-3">
          <div className="flex items-center gap-5 min-w-0">
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group min-w-0">
              <Image
                src="/settlla-4x.png"
                alt="Settlla"
                width={36}
                height={36}
                className="h-9 w-9 rounded-[var(--radius-control)] object-contain"
              />
              <div className="hidden sm:block min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold tracking-tight text-[var(--settlla-text)]">Settlla</span>
                  <span className="dashboard-hub-badge">{hubBadge}</span>
                </div>
                <p className="text-caption truncate max-w-[14rem]">{hubSubtitle}</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-3 text-caption font-semibold text-[var(--settlla-text-muted)]">
              <Link href="/" className="hover:text-[var(--settlla-brand)] transition-colors">
                {feedLinkLabel}
              </Link>
              <span className="text-[var(--settlla-border-strong)]" aria-hidden>
                /
              </span>
              <span className="text-[var(--settlla-text)] font-semibold">{currentNavLabel}</span>
            </nav>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="dashboard-user-pill hidden sm:flex">
              <User className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
              <div className="text-left min-w-0">
                <span className="text-xs font-semibold text-[var(--settlla-text)] block truncate max-w-[10rem]">
                  {userTitle}
                </span>
                <span className="text-[10px] font-medium text-[var(--settlla-text-muted)] block truncate">
                  {userSubtitle}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onSwitchRole}
              className="hidden lg:inline-flex btn btn-sm btn-secondary"
              title={switchRoleLabel}
            >
              {isAgent ? <User className="h-3.5 w-3.5" /> : <Building2 className="h-3.5 w-3.5" />}
              <span>{switchRoleLabel}</span>
            </button>

            <Link href="/" onClick={() => onSignOut()} className="btn btn-sm btn-ghost">
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="settlla-container flex-1 py-6 lg:py-8 space-y-6 lg:space-y-8">
        <section className="settlla-card p-5 sm:p-6 lg:p-7 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="min-w-0 space-y-2">
            <p className="text-overline">{pageTitle === userTitle ? "Welcome back" : "Dashboard"}</p>
            <h1 className="text-h2 truncate">{pageTitle}</h1>
            {pageDescription && <p className="text-body max-w-2xl">{pageDescription}</p>}
            {pageMeta && <div className="flex flex-wrap items-center gap-2 pt-1">{pageMeta}</div>}
          </div>
          {pageAction && <div className="flex shrink-0 w-full md:w-auto">{pageAction}</div>}
        </section>

        <div className="dashboard-tabs no-scrollbar" role="tablist" aria-label="Dashboard sections">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => onTabChange(tab.id)}
                className={`dashboard-tab ${selected ? "dashboard-tab-active" : ""}`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="dashboard-panel space-y-6">{children}</div>
      </main>

      <footer className="border-t border-[var(--settlla-border)] bg-white py-4 mt-auto hidden lg:block">
        <p className="settlla-container text-center text-caption">
          Settlla Kaduna Hub · Escrow-protected residential leasing
        </p>
      </footer>

      <nav
        aria-label="Mobile dashboard navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[var(--settlla-border)] bg-white/95 backdrop-blur-md pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex items-center justify-around max-w-md mx-auto px-2 py-2">
          <Link href="/" className="dashboard-mobile-nav-item">
            <Home className="h-5 w-5" />
            <span>Home</span>
          </Link>
          <span className="dashboard-mobile-nav-item dashboard-mobile-nav-active">
            <HubIcon className="h-5 w-5" />
            <span>{mobileNavActiveLabel}</span>
          </span>
          <button type="button" onClick={onSwitchRole} className="dashboard-mobile-nav-item">
            {isAgent ? <User className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
            <span>Switch</span>
          </button>
          <button type="button" onClick={onSignOut} className="dashboard-mobile-nav-item text-rose-600">
            <LogOut className="h-5 w-5" />
            <span>Out</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

interface DashboardStatProps {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: LucideIcon;
}

export function DashboardStat({ label, value, hint, icon: Icon }: DashboardStatProps) {
  return (
    <div className="dashboard-stat">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="dashboard-stat-label">{label}</span>
        {Icon && <Icon className="h-4 w-4 text-[var(--settlla-text-subtle)] shrink-0" aria-hidden />}
      </div>
      <p className="dashboard-stat-value">{value}</p>
      {hint && <div className="mt-2">{hint}</div>}
    </div>
  );
}

interface DashboardSectionHeadProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function DashboardSectionHead({ title, description, action }: DashboardSectionHeadProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-1">
      <div>
        <h2 className="text-h3">{title}</h2>
        {description && <p className="text-caption mt-1 max-w-2xl">{description}</p>}
      </div>
      {action}
    </div>
  );
}

type CalloutVariant = "info" | "success" | "warning";

const calloutStyles: Record<CalloutVariant, string> = {
  info: "border-[var(--settlla-brand)]/25 bg-[var(--settlla-brand-muted)]/60",
  success: "border-emerald-200 bg-[var(--settlla-success-muted)]/80",
  warning: "border-amber-200 bg-amber-50/90",
};

export function DashboardCallout({
  variant = "info",
  icon: Icon,
  title,
  children,
  actions,
}: {
  variant?: CalloutVariant;
  icon?: LucideIcon;
  title: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div
      className={`settlla-card p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 ${calloutStyles[variant]}`}
    >
      <div className="flex items-start gap-3 min-w-0">
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/80 border border-[var(--settlla-border)]">
            <Icon className="h-5 w-5 text-[var(--dashboard-accent,var(--settlla-brand))]" aria-hidden />
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-h3 text-base">{title}</h3>
          {children && <div className="text-caption mt-1">{children}</div>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export function DashboardCountdown({
  title = "Lease time remaining",
  subtitle,
  days,
  hours,
  minutes,
  seconds,
  footer,
}: {
  title?: string;
  subtitle?: string;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  footer?: React.ReactNode;
}) {
  const units = [
    { label: "Days", value: String(days) },
    { label: "Hours", value: String(hours).padStart(2, "0") },
    { label: "Min", value: String(minutes).padStart(2, "0") },
    { label: "Sec", value: String(seconds).padStart(2, "0"), accent: true },
  ];

  return (
    <div className="settlla-card p-5 sm:p-6 space-y-4 border-emerald-200/70 bg-[var(--settlla-success-muted)]/30">
      <div>
        <p className="text-overline text-emerald-700">Active tenancy</p>
        <h3 className="text-h3 mt-0.5">{title}</h3>
        {subtitle && <p className="text-caption mt-1">{subtitle}</p>}
      </div>
      <div className="dashboard-countdown-grid">
        {units.map((u) => (
          <div key={u.label} className="dashboard-countdown-cell">
            <span
              className={`dashboard-countdown-value ${u.accent ? "text-emerald-600" : ""}`}
            >
              {u.value}
            </span>
            <span className="dashboard-countdown-label">{u.label}</span>
          </div>
        ))}
      </div>
      {footer && <div className="pt-3 border-t border-[var(--settlla-border)] text-caption">{footer}</div>}
    </div>
  );
}
