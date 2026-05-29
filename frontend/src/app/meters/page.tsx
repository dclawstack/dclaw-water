"use client";

import { useEffect, useState } from "react";
import {
  listMeters, createMeter, updateMeter, deleteMeter,
  type Meter, type LocationType, type MeterStatus,
} from "@/lib/api";
import { AppShell } from "@/components/nav";
import { CopilotChat } from "@/components/copilot-chat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select } from "@/components/ui/select";

const STATUS_COLOR: Record<MeterStatus, string> = {
  active: "#2E8B57",
  inactive: "#7A7A85",
  fault: "#B3261E",
};

const STATUS_BG: Record<MeterStatus, string> = {
  active: "#E6F4EC",
  inactive: "#F2F2F4",
  fault: "#FBE9E7",
};

export default function MetersPage() {
  const [meters, setMeters] = useState<Meter[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    meter_code: "",
    location_name: "",
    location_type: "zone" as LocationType,
    status: "active" as MeterStatus,
    latitude: "",
    longitude: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await listMeters(50, 0);
      setMeters(data.items);
      setTotal(data.total);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate() {
    setError("");
    setSubmitting(true);
    try {
      await createMeter({
        meter_code: form.meter_code,
        location_name: form.location_name,
        location_type: form.location_type,
        status: form.status,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
      });
      setShowAdd(false);
      setForm({ meter_code: "", location_name: "", location_type: "zone", status: "active", latitude: "", longitude: "" });
      await load();
    } catch (e: unknown) {
      setError((e as Error).message || "Failed to create meter");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this meter and all related data?")) return;
    await deleteMeter(id);
    await load();
  }

  async function handleStatusToggle(meter: Meter) {
    const next: MeterStatus = meter.status === "active" ? "inactive" : "active";
    await updateMeter(meter.id, { status: next });
    await load();
  }

  return (
    <AppShell>
      <div className="p-8 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#7660A8" }}>
              Network
            </p>
            <h1 className="text-3xl font-bold" style={{ color: "#0F0F12" }}>Water Meters</h1>
            <p className="mt-1 text-sm" style={{ color: "#7A7A85" }}>{total} meters registered</p>
          </div>
          <Button onClick={() => setShowAdd(true)} style={{ background: "#7660A8" }}>
            + Add Meter
          </Button>
        </div>

        <Card className="shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <p className="text-sm p-6" style={{ color: "#7A7A85" }}>Loading…</p>
            ) : meters.length === 0 ? (
              <p className="text-sm p-6 text-center" style={{ color: "#A3A3AC" }}>
                No meters yet. Add your first meter to start monitoring.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {meters.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-mono text-sm font-semibold">{m.meter_code}</TableCell>
                      <TableCell>{m.location_name}</TableCell>
                      <TableCell className="capitalize">{m.location_type}</TableCell>
                      <TableCell>
                        <span
                          className="text-xs font-semibold px-2 py-1 rounded-full capitalize"
                          style={{
                            background: STATUS_BG[m.status as MeterStatus],
                            color: STATUS_COLOR[m.status as MeterStatus],
                          }}
                        >
                          {m.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs" style={{ color: "#7A7A85" }}>
                        {new Date(m.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusToggle(m)}
                          >
                            {m.status === "active" ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(m.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Water Meter</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div>
              <Label>Meter Code *</Label>
              <Input
                placeholder="M-001"
                value={form.meter_code}
                onChange={(e) => setForm((f) => ({ ...f, meter_code: e.target.value }))}
              />
            </div>
            <div>
              <Label>Location Name *</Label>
              <Input
                placeholder="Building A, Zone 3…"
                value={form.location_name}
                onChange={(e) => setForm((f) => ({ ...f, location_name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm mt-1"
                  style={{ borderColor: "#E8E8EC" }}
                  value={form.location_type}
                  onChange={(e) => setForm((f) => ({ ...f, location_type: e.target.value as LocationType }))}
                >
                  <option value="zone">Zone</option>
                  <option value="building">Building</option>
                  <option value="process">Process</option>
                  <option value="distribution">Distribution</option>
                </select>
              </div>
              <div>
                <Label>Status</Label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm mt-1"
                  style={{ borderColor: "#E8E8EC" }}
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as MeterStatus }))}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="fault">Fault</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Latitude</Label>
                <Input
                  type="number"
                  placeholder="28.6139"
                  value={form.latitude}
                  onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))}
                />
              </div>
              <div>
                <Label>Longitude</Label>
                <Input
                  type="number"
                  placeholder="77.2090"
                  value={form.longitude}
                  onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))}
                />
              </div>
            </div>
            <Button
              onClick={handleCreate}
              disabled={submitting || !form.meter_code || !form.location_name}
              style={{ background: "#7660A8" }}
            >
              {submitting ? "Creating…" : "Create Meter"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <CopilotChat />
    </AppShell>
  );
}
