const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!response.ok) {
    const error = await response.text();
    throw new ApiError(`API error ${response.status}: ${error}`, response.status);
  }
  return response.json();
}

// ── Types ──────────────────────────────────────────────────────────────────

export type LocationType = "building" | "process" | "zone" | "distribution";
export type MeterStatus = "active" | "inactive" | "fault";
export type AlertType = "consumption_spike" | "pressure_drop" | "acoustic";
export type AlertSeverity = "low" | "medium" | "high" | "critical";
export type AlertStatus = "open" | "investigating" | "resolved";
export type MessageRole = "user" | "assistant";

export interface Meter {
  id: string;
  meter_code: string;
  location_name: string;
  location_type: LocationType;
  status: MeterStatus;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
}

export interface MeterReading {
  id: string;
  meter_id: string;
  reading_value_kl: number;
  flow_rate_lps: number;
  pressure_bar: number | null;
  recorded_at: string;
  created_at: string;
}

export interface LeakAlert {
  id: string;
  meter_id: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  description: string;
  estimated_loss_lph: number | null;
  detected_at: string;
  resolved_at: string | null;
  created_at: string;
}

export interface QualityReading {
  id: string;
  meter_id: string;
  ph: number;
  turbidity_ntu: number;
  chlorine_mgl: number;
  temperature_c: number | null;
  is_compliant: boolean;
  recorded_at: string;
  created_at: string;
}

export interface DashboardStats {
  total_meters: number;
  active_meters: number;
  fault_meters: number;
  open_leak_alerts: number;
  critical_alerts: number;
  total_consumption_kl: number;
  non_compliant_readings: number;
  avg_ph: number | null;
  avg_turbidity: number | null;
  avg_chlorine: number | null;
}

export interface DashboardOverview {
  stats: DashboardStats;
  top_consumers: { meter_code: string; location_name: string; total_kl: number }[];
  recent_alerts: { id: string; alert_type: string; severity: string; status: string; detected_at: string }[];
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: MessageRole;
  content: string;
  created_at: string;
}

// ── Health ─────────────────────────────────────────────────────────────────

export async function getHealth() {
  return fetchJson<{ status: string }>("/health/");
}

// ── Dashboard ──────────────────────────────────────────────────────────────

export async function getDashboard(): Promise<DashboardOverview> {
  return fetchJson<DashboardOverview>("/api/v1/dashboard/");
}

// ── Meters ─────────────────────────────────────────────────────────────────

export async function listMeters(limit = 50, offset = 0) {
  return fetchJson<{ items: Meter[]; total: number }>(`/api/v1/meters/?limit=${limit}&offset=${offset}`);
}

export async function getMeter(id: string) {
  return fetchJson<Meter>(`/api/v1/meters/${id}`);
}

export async function createMeter(body: Omit<Meter, "id" | "created_at" | "updated_at">) {
  return fetchJson<Meter>("/api/v1/meters/", { method: "POST", body: JSON.stringify(body) });
}

export async function updateMeter(id: string, body: Partial<Meter>) {
  return fetchJson<Meter>(`/api/v1/meters/${id}`, { method: "PUT", body: JSON.stringify(body) });
}

export async function deleteMeter(id: string) {
  const url = `${API_BASE}/api/v1/meters/${id}`;
  const resp = await fetch(url, { method: "DELETE" });
  if (!resp.ok && resp.status !== 204) throw new ApiError("Delete failed", resp.status);
}

// ── Readings ───────────────────────────────────────────────────────────────

export async function listReadings(meterId?: string, limit = 50, offset = 0) {
  const q = meterId ? `&meter_id=${meterId}` : "";
  return fetchJson<{ items: MeterReading[]; total: number }>(`/api/v1/readings/?limit=${limit}&offset=${offset}${q}`);
}

export async function createReading(body: Omit<MeterReading, "id" | "created_at">) {
  return fetchJson<MeterReading>("/api/v1/readings/", { method: "POST", body: JSON.stringify(body) });
}

// ── Leaks ──────────────────────────────────────────────────────────────────

export async function listLeaks(openOnly = false, limit = 50, offset = 0) {
  return fetchJson<{ items: LeakAlert[]; total: number }>(
    `/api/v1/leaks/?open_only=${openOnly}&limit=${limit}&offset=${offset}`
  );
}

export async function createLeak(body: Omit<LeakAlert, "id" | "status" | "detected_at" | "resolved_at" | "created_at">) {
  return fetchJson<LeakAlert>("/api/v1/leaks/", { method: "POST", body: JSON.stringify(body) });
}

export async function updateLeak(id: string, body: { status?: AlertStatus; severity?: AlertSeverity; description?: string }) {
  return fetchJson<LeakAlert>(`/api/v1/leaks/${id}`, { method: "PUT", body: JSON.stringify(body) });
}

// ── Quality ────────────────────────────────────────────────────────────────

export async function listQuality(meterId?: string, limit = 50, offset = 0) {
  const q = meterId ? `&meter_id=${meterId}` : "";
  return fetchJson<{ items: QualityReading[]; total: number }>(`/api/v1/quality/?limit=${limit}&offset=${offset}${q}`);
}

export async function createQuality(body: Omit<QualityReading, "id" | "is_compliant" | "created_at">) {
  return fetchJson<QualityReading>("/api/v1/quality/", { method: "POST", body: JSON.stringify(body) });
}

// ── Copilot ────────────────────────────────────────────────────────────────

export async function chatWithCopilot(sessionId: string, message: string) {
  return fetchJson<{ user_message: ChatMessage; assistant_message: ChatMessage }>("/api/v1/copilot/chat", {
    method: "POST",
    body: JSON.stringify({ session_id: sessionId, message }),
  });
}

export async function getCopilotHistory(sessionId: string) {
  return fetchJson<{ session_id: string; messages: ChatMessage[] }>(`/api/v1/copilot/history/${sessionId}`);
}

export { ApiError };
