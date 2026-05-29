"use client";

import { useEffect, useState } from "react";
import { getDashboard, type DashboardOverview } from "@/lib/api";
import { AppShell } from "@/components/nav";
import { CopilotChat } from "@/components/copilot-chat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SEVERITY_COLOR: Record<string, string> = {
  critical: "#B3261E",
  high: "#C28A00",
  medium: "#2C6CB0",
  low: "#2E8B57",
};

const STATUS_BG: Record<string, string> = {
  open: "#FBE9E7",
  investigating: "#FBF1DC",
  resolved: "#E6F4EC",
};

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <Card className="shadow-sm">
      <CardContent className="pt-5 pb-4">
        <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#7A7A85" }}>
          {label}
        </p>
        <p className="text-3xl font-bold" style={{ color: accent || "#0F0F12" }}>
          {value}
        </p>
        {sub && <p className="text-xs mt-1" style={{ color: "#A3A3AC" }}>{sub}</p>}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const s = data?.stats;

  return (
    <AppShell>
      <div className="p-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#7660A8" }}>
            Overview
          </p>
          <h1 className="text-3xl font-bold" style={{ color: "#0F0F12" }}>
            Water Network Dashboard
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#7A7A85" }}>
            Real-time monitoring across all meters, alerts, and quality parameters.
          </p>
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: "#7A7A85" }}>Loading dashboard…</p>
        ) : (
          <>
            {/* KPI grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="Total Meters" value={s?.total_meters ?? 0} sub={`${s?.active_meters ?? 0} active`} />
              <StatCard
                label="Open Leak Alerts"
                value={s?.open_leak_alerts ?? 0}
                sub={`${s?.critical_alerts ?? 0} critical`}
                accent={s?.open_leak_alerts ? "#B3261E" : undefined}
              />
              <StatCard
                label="Total Consumption"
                value={`${(s?.total_consumption_kl ?? 0).toLocaleString()} kL`}
              />
              <StatCard
                label="Non-Compliant Readings"
                value={s?.non_compliant_readings ?? 0}
                accent={s?.non_compliant_readings ? "#C28A00" : undefined}
              />
            </div>

            {/* Water Quality KPIs */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <StatCard label="Avg pH" value={s?.avg_ph ?? "—"} sub="Target: 6.5–8.5" />
              <StatCard label="Avg Turbidity" value={s?.avg_turbidity ? `${s.avg_turbidity} NTU` : "—"} sub="Target: ≤ 4 NTU" />
              <StatCard label="Avg Chlorine" value={s?.avg_chlorine ? `${s.avg_chlorine} mg/L` : "—"} sub="Target: 0.2–4 mg/L" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top consumers */}
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold" style={{ color: "#404049" }}>
                    Top Consumers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data?.top_consumers.length === 0 ? (
                    <p className="text-sm" style={{ color: "#A3A3AC" }}>No consumption data yet.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {data?.top_consumers.map((c, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium" style={{ color: "#0F0F12" }}>{c.location_name}</p>
                            <p className="text-xs" style={{ color: "#7A7A85" }}>{c.meter_code}</p>
                          </div>
                          <span className="text-sm font-semibold" style={{ color: "#7660A8" }}>
                            {c.total_kl.toLocaleString()} kL
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent alerts */}
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold" style={{ color: "#404049" }}>
                    Recent Leak Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data?.recent_alerts.length === 0 ? (
                    <p className="text-sm" style={{ color: "#A3A3AC" }}>No alerts. Network looks healthy!</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {data?.recent_alerts.map((a) => (
                        <div
                          key={a.id}
                          className="flex items-start gap-3 p-2 rounded-lg"
                          style={{ background: STATUS_BG[a.status] || "#F8F8FA" }}
                        >
                          <div className="flex-1">
                            <p className="text-xs font-semibold" style={{ color: "#0F0F12" }}>
                              {a.alert_type.replace(/_/g, " ").toUpperCase()}
                            </p>
                            <p className="text-xs" style={{ color: "#7A7A85" }}>
                              {new Date(a.detected_at).toLocaleString()}
                            </p>
                          </div>
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{
                              background: SEVERITY_COLOR[a.severity] + "22",
                              color: SEVERITY_COLOR[a.severity],
                            }}
                          >
                            {a.severity}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
      <CopilotChat />
    </AppShell>
  );
}
