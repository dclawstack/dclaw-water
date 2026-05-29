"use client";

import { useEffect, useState } from "react";
import {
  listLeaks, listMeters, createLeak, updateLeak,
  type LeakAlert, type Meter, type AlertType, type AlertSeverity, type AlertStatus,
} from "@/lib/api";
import { AppShell } from "@/components/nav";
import { CopilotChat } from "@/components/copilot-chat";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const SEV_COLOR: Record<string, string> = {
  critical: "#B3261E",
  high: "#C28A00",
  medium: "#2C6CB0",
  low: "#2E8B57",
};

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  open: { bg: "#FBE9E7", color: "#B3261E" },
  investigating: { bg: "#FBF1DC", color: "#C28A00" },
  resolved: { bg: "#E6F4EC", color: "#2E8B57" },
};

export default function LeaksPage() {
  const [alerts, setAlerts] = useState<LeakAlert[]>([]);
  const [total, setTotal] = useState(0);
  const [meters, setMeters] = useState<Meter[]>([]);
  const [loading, setLoading] = useState(true);
  const [openOnly, setOpenOnly] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    meter_id: "",
    alert_type: "pressure_drop" as AlertType,
    severity: "medium" as AlertSeverity,
    description: "",
    estimated_loss_lph: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [a, m] = await Promise.all([listLeaks(openOnly, 50), listMeters(200)]);
      setAlerts(a.items);
      setTotal(a.total);
      setMeters(m.items);
      if (m.items.length > 0 && !form.meter_id) {
        setForm((f) => ({ ...f, meter_id: m.items[0].id }));
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [openOnly]);

  const meterMap = Object.fromEntries(meters.map((m) => [m.id, m]));

  async function handleCreate() {
    setError("");
    setSubmitting(true);
    try {
      await createLeak({
        meter_id: form.meter_id,
        alert_type: form.alert_type,
        severity: form.severity,
        description: form.description,
        estimated_loss_lph: form.estimated_loss_lph ? parseFloat(form.estimated_loss_lph) : null,
      });
      setShowAdd(false);
      await load();
    } catch (e: unknown) {
      setError((e as Error).message || "Failed to create alert");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResolve(id: string) {
    await updateLeak(id, { status: "resolved" });
    await load();
  }

  async function handleInvestigate(id: string) {
    await updateLeak(id, { status: "investigating" });
    await load();
  }

  return (
    <AppShell>
      <div className="p-8 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#7660A8" }}>
              Leak Detection
            </p>
            <h1 className="text-3xl font-bold" style={{ color: "#0F0F12" }}>Leak Alerts</h1>
            <p className="mt-1 text-sm" style={{ color: "#7A7A85" }}>{total} alerts</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant={openOnly ? "default" : "outline"}
              onClick={() => setOpenOnly((v) => !v)}
              style={openOnly ? { background: "#7660A8" } : {}}
            >
              {openOnly ? "Showing Open Only" : "Show Open Only"}
            </Button>
            <Button onClick={() => setShowAdd(true)} disabled={meters.length === 0} style={{ background: "#B3261E", color: "#fff" }}>
              + Report Alert
            </Button>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <p className="text-sm p-6" style={{ color: "#7A7A85" }}>Loading…</p>
            ) : alerts.length === 0 ? (
              <p className="text-sm p-6 text-center" style={{ color: "#A3A3AC" }}>
                {openOnly ? "No open alerts — network is clean!" : "No leak alerts recorded."}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Meter</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Loss (L/h)</TableHead>
                    <TableHead>Detected</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.map((a) => {
                    const m = meterMap[a.meter_id];
                    const ss = STATUS_STYLE[a.status] || STATUS_STYLE.open;
                    return (
                      <TableRow key={a.id}>
                        <TableCell>
                          <div>
                            <p className="text-sm font-semibold font-mono">{m?.meter_code ?? "—"}</p>
                            <p className="text-xs" style={{ color: "#7A7A85" }}>{m?.location_name}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-medium capitalize">
                          {a.alert_type.replace(/_/g, " ")}
                        </TableCell>
                        <TableCell>
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full capitalize"
                            style={{ background: SEV_COLOR[a.severity] + "22", color: SEV_COLOR[a.severity] }}
                          >
                            {a.severity}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
                            style={{ background: ss.bg, color: ss.color }}
                          >
                            {a.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          {a.estimated_loss_lph ? a.estimated_loss_lph.toLocaleString() : "—"}
                        </TableCell>
                        <TableCell className="text-xs" style={{ color: "#7A7A85" }}>
                          {new Date(a.detected_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {a.status === "open" && (
                            <Button variant="outline" size="sm" onClick={() => handleInvestigate(a.id)}>
                              Investigate
                            </Button>
                          )}
                          {a.status === "investigating" && (
                            <Button size="sm" onClick={() => handleResolve(a.id)} style={{ background: "#2E8B57", color: "#fff" }}>
                              Resolve
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Leak Alert</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div>
              <Label>Meter *</Label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm mt-1"
                style={{ borderColor: "#E8E8EC" }}
                value={form.meter_id}
                onChange={(e) => setForm((f) => ({ ...f, meter_id: e.target.value }))}
              >
                {meters.map((m) => (
                  <option key={m.id} value={m.id}>{m.meter_code} — {m.location_name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Alert Type</Label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm mt-1"
                  style={{ borderColor: "#E8E8EC" }}
                  value={form.alert_type}
                  onChange={(e) => setForm((f) => ({ ...f, alert_type: e.target.value as AlertType }))}
                >
                  <option value="pressure_drop">Pressure Drop</option>
                  <option value="consumption_spike">Consumption Spike</option>
                  <option value="acoustic">Acoustic</option>
                </select>
              </div>
              <div>
                <Label>Severity</Label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm mt-1"
                  style={{ borderColor: "#E8E8EC" }}
                  value={form.severity}
                  onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value as AlertSeverity }))}
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Input
                placeholder="Sudden pressure drop detected in zone 3 main…"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div>
              <Label>Estimated Loss (L/h)</Label>
              <Input
                type="number"
                placeholder="500"
                value={form.estimated_loss_lph}
                onChange={(e) => setForm((f) => ({ ...f, estimated_loss_lph: e.target.value }))}
              />
            </div>
            <Button
              onClick={handleCreate}
              disabled={submitting || !form.meter_id}
              style={{ background: "#B3261E", color: "#fff" }}
            >
              {submitting ? "Reporting…" : "Report Alert"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <CopilotChat />
    </AppShell>
  );
}
