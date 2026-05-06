const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export async function analyzeWaterUsage(facility_id: string) {
  const res = await fetch(`${API_BASE}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ facility_id }),
  });
  if (!res.ok) throw new Error('Failed to analyze water usage');
  return res.json();
}

export async function getZones(reportId: string) {
  const res = await fetch(`${API_BASE}/reports/${reportId}/zones`);
  if (!res.ok) throw new Error('Failed to fetch zones');
  return res.json();
}
