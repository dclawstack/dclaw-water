"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "⬛" },
  { href: "/meters", label: "Meters", icon: "📟" },
  { href: "/readings", label: "Readings", icon: "📊" },
  { href: "/leaks", label: "Leak Alerts", icon: "🔴" },
  { href: "/quality", label: "Quality", icon: "🧪" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <aside
      className="w-56 shrink-0 border-r flex flex-col min-h-screen"
      style={{ background: "#F8F6FB", borderColor: "#E2DCEE" }}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: "#E2DCEE" }}>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
            style={{ background: "#7660A8" }}
          >
            W
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: "#0F0F12" }}>DClaw Water</p>
            <p className="text-xs" style={{ color: "#7A7A85" }}>v1.0</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "text-white"
                  : "hover:bg-white"
              )}
              style={
                active
                  ? { background: "#7660A8", color: "#fff" }
                  : { color: "#404049" }
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t" style={{ borderColor: "#E2DCEE" }}>
        <p className="text-xs" style={{ color: "#A3A3AC" }}>DClaw Stack © 2026</p>
      </div>
    </aside>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: "#F8F8FA" }}>
      <Nav />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
