"use client";

import { useEffect, useState } from "react";
import { listQuality, listMeters, createQuality, type QualityReading, type Meter } from "@/lib/api";
import { AppShell } from "@/components/nav";
import { CopilotChat } from "@/components/copilot-chat";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function QParam({ label, value, unit, min, max }: {
  label: string; value: number; unit: string; min: number; max: number;
}) {
  const ok = value >= min && value <= max;
  return (
    <div
      className="rounded-xl p-3"
      style={{ background: ok ? "#E6F4EC" : "#FBE9E7" }}
    >
      <p className="text-xs font-semibold" style={{ color: ok ? "#2E8B57" : "#B3261E" }}>{label}</p>
      <p className="text-lg font-bold mt-0.5" style={{ color: "#0F0F12" }}>{value} {unit}</p>
      <p className="text-xs mt-0.5" style={{ color: "#7A7A85" }}>Target: {min}–{max}</p>
    </div>
  );
}

export default function QualityPage() {
  const [readings, setReadings] = useState<QualityReading[]>([]);
  const [total, setTotal] = useState(0);
  const [meters, setMeters] = useState<Meter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    meter_id: "",
    ph: "",
    turbidity_ntu: "",
    chlorine_mgl: "",
    temperature_c: "",
    recorded_at: new Date().toISOString().slice(0, 16),
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [q, m] = await Promise.all([listQuality(undefined, 50), listMeters(200)]);
      setReadings(q.items);
      setTotal(q.total);
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

  const latest = readings[0];

  async function handleCreate() {
    setError("");
    setSubmitting(true);
    try {
      await createQuality({
        meter_id: form.meter_id,
        ph: parseFloat(form.ph),
        turbidity_ntu: parseFloat(form.turbidity_ntu),
        chlorine_mgl: parseFloat(form.chlorine_mgl),
        temperature_c: form.temperature_c ? parseFloat(form.temperature_c) : null,
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
              Water Quality
            </p>
            <h1 className="text-3xl font-bold" style={{ color: "#0F0F12" }}>Quality Monitoring</h1>
            <p className="mt-1 text-sm" style={{ color: "#7A7A85" }}>{total} readings • pH, Turbidity, Chlorine</p>
          </div>
          <Button onClick={() => setShowAdd(true)} disabled={meters.length === 0} style={{ background: "#7660A8" }}>
            + Log Sample
          </Button>
        </div>

        {latest && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <QParam label="pH" value={latest.ph} unit="" min={6.5} max={8.5} />
            <QParam label="Turbidity" value={latest.turbidity_ntu} unit="NTU" min={0} max={4} />
            <QParam label="Chlorine" value={latest.chlorine_mgl} unit="mg/L" min={0.2} max={4} />
          </div>
        )}

        {meters.length === 0 && !loading && (
          <div className="rounded-xl p-4 mb-6 text-sm" style={{ background: "#FBF1DC", color: "#C28A00" }}>
            Add at least one meter before logging quality samples.
          </div>
        )}

        <Card className="shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <p className="text-sm p-6" style={{ color: "#7A7A85" }}>Loading…</p>
            ) : readings.length === 0 ? (
              <p className="text-sm p-6 text-center" style={{ color: "#A3A3AC" }}>
                No quality readings yet. Log your first water sample.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Meter</TableHead>
                    <TableHead>pH</TableHead>
                    <TableHead>Turbidity (NTU)</TableHead>
                    <TableHead>Chlorine (mg/L)</TableHead>
                    <TableHead>Temp (°C)</TableHead>
                    <TableHead>Compliant</TableHead>
                    <TableHead>Recorded</TableHead>
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
                            <p className="text-xs" style={{ color: "#7A7A85" }}>{m?.location_name}</p>
                          </div>
                        </TableCell>
                        <TableCell className={r.ph < 6.5 || r.ph > 8.5 ? "text-red-600 font-semibold" : ""}>
                          {r.ph}
                        </TableCell>
                        <TableCell className={r.turbidity_ntu > 4 ? "text-red-600 font-semibold" : ""}>
                          {r.turbidity_ntu}
                        </TableCell>
                        <TableCell className={r.chlorine_mgl < 0.2 || r.chlorine_mgl > 4 ? "text-red-600 font-semibold" : ""}>
                          {r.chlorine_mgl}
                        </TableCell>
                        <TableCell>{r.temperature_c ?? "—"}</TableCell>
                        <TableCell>
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={
                              r.is_compliant
                                ? { background: "#E6F4EC", color: "#2E8B57" }
                                : { background: "#FBE9E7", color: "#B3261E" }
                            }
                          >
                            {r.is_compliant ? "✓ Pass" : "✗ Fail"}
                          </span>
                        </TableCell>
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
            <DialogTitle>Log Water Quality Sample</DialogTitle>
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
                <Label>pH *</Label>
                <Input type="number" step="0.1" placeholder="7.2" value={form.ph}
                  onChange={(e) => setForm((f) => ({ ...f, ph: e.target.value }))} />
              </div>
              <div>
                <Label>Turbidity (NTU) *</Label>
                <Input type="number" step="0.1" placeholder="1.5" value={form.turbidity_ntu}
                  onChange={(e) => setForm((f) => ({ ...f, turbidity_ntu: e.target.value }))} />
              </div>
              <div>
                <Label>Chlorine (mg/L) *</Label>
                <Input type="number" step="0.01" placeholder="1.0" value={form.chlorine_mgl}
                  onChange={(e) => setForm((f) => ({ ...f, chlorine_mgl: e.target.value }))} />
              </div>
              <div>
                <Label>Temperature (°C)</Label>
                <Input type="number" step="0.1" placeholder="18.5" value={form.temperature_c}
                  onChange={(e) => setForm((f) => ({ ...f, temperature_c: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Recorded At *</Label>
              <Input type="datetime-local" value={form.recorded_at}
                onChange={(e) => setForm((f) => ({ ...f, recorded_at: e.target.value }))} />
            </div>
            <Button
              onClick={handleCreate}
              disabled={submitting || !form.meter_id || !form.ph || !form.turbidity_ntu || !form.chlorine_mgl}
              style={{ background: "#7660A8" }}
            >
              {submitting ? "Saving…" : "Log Sample"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <CopilotChat />
    </AppShell>
  );
}
