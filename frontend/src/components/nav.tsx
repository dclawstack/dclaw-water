"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard",   icon: "⬛" },
  { href: "/meters",    label: "Meters",       icon: "📟" },
  { href: "/readings",  label: "Readings",     icon: "📊" },
  { href: "/leaks",     label: "Leak Alerts",  icon: "🔴" },
  { href: "/quality",   label: "Quality",      icon: "🧪" },
];

export function Nav() {
  const pathname = usePathname();
  const router   = useRouter();
  const [userName,  setUserName]  = useState("");
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setUserName(user.full_name || user.email || "");
    } catch { /* ignore */ }
    const saved = localStorage.getItem("nav_collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  function toggleCollapse() {
    setCollapsed((c) => {
      localStorage.setItem("nav_collapsed", String(!c));
      return !c;
    });
  }

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    router.push("/login");
  }

  return (
    <aside
      className="shrink-0 border-r flex flex-col h-screen sticky top-0 transition-all duration-200"
      style={{
        width: collapsed ? 56 : 224,
        background: "#F8F6FB",
        borderColor: "#E2DCEE",
        overflow: "hidden",
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 border-b hover:bg-white/60 transition-colors shrink-0"
        style={{ borderColor: "#E2DCEE", padding: collapsed ? "20px 14px" : "20px" }}
        title="DClaw Water — Home"
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
          style={{ background: "#7660A8" }}
        >
          💧
        </div>
        {!collapsed && (
          <div>
            <p className="font-semibold text-sm whitespace-nowrap" style={{ color: "#0F0F12" }}>DClaw Water</p>
            <p className="text-xs" style={{ color: "#7A7A85" }}>v1.0</p>
          </div>
        )}
      </Link>

      {/* Nav links */}
      <nav className="flex-1 px-2 py-4 flex flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg text-sm font-medium transition-colors",
                collapsed ? "justify-center px-0 py-2" : "px-3 py-2",
                active ? "text-white" : "hover:bg-white"
              )}
              style={active ? { background: "#7660A8", color: "#fff" } : { color: "#404049" }}
            >
              <span className="text-base shrink-0">{item.icon}</span>
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout + Collapse */}
      <div className="shrink-0 border-t flex flex-col gap-1 py-3 px-2" style={{ borderColor: "#E2DCEE" }}>
        {/* User chip */}
        {userName && !collapsed && (
          <div className="flex items-center gap-2 px-2 py-1 mb-1">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ background: "#7660A8" }}
            >
              {userName[0].toUpperCase()}
            </div>
            <span className="text-xs truncate" style={{ color: "#404049" }}>{userName}</span>
          </div>
        )}
        {userName && collapsed && (
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold mx-auto mb-1"
            style={{ background: "#7660A8" }}
            title={userName}
          >
            {userName[0].toUpperCase()}
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          title={collapsed ? "Sign Out" : undefined}
          className={cn(
            "flex items-center gap-2 rounded-lg text-sm font-medium w-full transition-colors hover:bg-white",
            collapsed ? "justify-center px-0 py-2" : "px-3 py-2"
          )}
          style={{ color: "#B3261E" }}
        >
          <span className="text-base shrink-0">🚪</span>
          {!collapsed && "Sign Out"}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={toggleCollapse}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "flex items-center gap-2 rounded-lg text-sm font-medium w-full transition-colors hover:bg-white mt-1",
            collapsed ? "justify-center px-0 py-2" : "px-3 py-2"
          )}
          style={{ color: "#7A7A85" }}
        >
          <span className="text-base shrink-0">{collapsed ? "▶" : "◀"}</span>
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#F8F8FA" }}>
      <Nav />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
