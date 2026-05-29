"use client";

import { useEffect, useState } from "react";
import { listReadings, listMeters, createReading, type MeterReading, type Meter } from "@/lib/api";
import { AppShell } from "@/components/nav";
import { CopilotChat } from "@/components/copilot-chat";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ReadingsPage() {
  const [readings, setReadings] = useState<MeterReading[]>([]);
  const [total, setTotal] = useState(0);
  const [meters, setMeters] = useState<Meter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    meter_id: "",
    reading_value_kl: "",
    flow_rate_lps: "",
    pressure_bar: "",
    recorded_at: new Date().toISOString().slice(0, 16),
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [r, m] = await Promise.all([listReadings(undefined, 50), listMeters(200)]);
      setReadings(r.items);
      setTotal(r.total);
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

  useEffect(() => { load(); }, []);

  const meterMap = Object.fromEntries(meters.map((m) => [m.id, m]));

  async function handleCreate() {
    setError("");
    setSubmitting(true);
    try {
      await createReading({
        meter_id: form.meter_id,
        reading_value_kl: parseFloat(form.reading_value_kl),
        flow_rate_lps: parseFloat(form.flow_rate_lps || "0"),
        pressure_bar: form.pressure_bar ? parseFloat(form.pressure_bar) : null,
        recorded_at: new Date(form.recorded_at).toISOString(),
      });
      setShowAdd(false);
      await load();
    } catch (e: unknown) {
      setError((e as Error).message || "Failed to create reading");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <div className="p-8 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#7660A8" }}>
              Consumption
            </p>
            <h1 className="text-3xl font-bold" style={{ color: "#0F0F12" }}>Meter Readings</h1>
            <p className="mt-1 text-sm" style={{ color: "#7A7A85" }}>{total} total readings</p>
          </div>
          <Button onClick={() => setShowAdd(true)} disabled={meters.length === 0} style={{ background: "#7660A8" }}>
            + Log Reading
          </Button>
        </div>

        {meters.length === 0 && !loading && (
          <div
            className="rounded-xl p-4 mb-6 text-sm"
            style={{ background: "#FBF1DC", color: "#C28A00" }}
          >
            Add at least one meter before logging readings.
          </div>
        )}

        <Card className="shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <p className="text-sm p-6" style={{ color: "#7A7A85" }}>Loading…</p>
            ) : readings.length === 0 ? (
              <p className="text-sm p-6 text-center" style={{ color: "#A3A3AC" }}>
                No readings yet. Log the first consumption reading.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Meter</TableHead>
                    <TableHead>Consumption (kL)</TableHead>
                    <TableHead>Flow Rate (L/s)</TableHead>
                    <TableHead>Pressure (bar)</TableHead>
                    <TableHead>Recorded At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {readings.map((r) => {
                    const m = meterMap[r.meter_id];
                    return (
                      <TableRow key={r.id}>
                        <TableCell>
                          <div>
                            <p className="text-sm font-semibold font-mono">{m?.meter_code ?? "—"}</p>
                            <p className="text-xs" style={{ color: "#7A7A85" }}>{m?.location_name ?? r.meter_id}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold" style={{ color: "#7660A8" }}>
                          {r.reading_value_kl.toLocaleString()}
                        </TableCell>
                        <TableCell>{r.flow_rate_lps}</TableCell>
                        <TableCell>{r.pressure_bar ?? "—"}</TableCell>
                        <TableCell className="text-xs" style={{ color: "#7A7A85" }}>
                          {new Date(r.recorded_at).toLocaleString()}
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
            <DialogTitle>Log Meter Reading</DialogTitle>
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
                  <option key={m.id} value={m.id}>
                    {m.meter_code} — {m.location_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Consumption (kL) *</Label>
                <Input
                  type="number"
                  placeholder="150.0"
                  value={form.reading_value_kl}
                  onChange={(e) => setForm((f) => ({ ...f, reading_value_kl: e.target.value }))}
                />
              </div>
              <div>
                <Label>Flow Rate (L/s)</Label>
                <Input
                  type="number"
                  placeholder="3.5"
                  value={form.flow_rate_lps}
                  onChange={(e) => setForm((f) => ({ ...f, flow_rate_lps: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Pressure (bar)</Label>
                <Input
                  type="number"
                  placeholder="4.2"
                  value={form.pressure_bar}
                  onChange={(e) => setForm((f) => ({ ...f, pressure_bar: e.target.value }))}
                />
              </div>
              <div>
                <Label>Recorded At *</Label>
                <Input
                  type="datetime-local"
                  value={form.recorded_at}
                  onChange={(e) => setForm((f) => ({ ...f, recorded_at: e.target.value }))}
                />
              </div>
            </div>
            <Button
              onClick={handleCreate}
              disabled={submitting || !form.meter_id || !form.reading_value_kl}
              style={{ background: "#7660A8" }}
            >
              {submitting ? "Saving…" : "Log Reading"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <CopilotChat />
    </AppShell>
  );
}
