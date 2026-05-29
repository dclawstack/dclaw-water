import Link from "next/link";
import { NavCTA, HeroCTA, BottomCTA } from "@/components/landing-actions";

/* ─── small reusable pieces ──────────────────────────────────────────────── */

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
      style={{ background: "#E2DCEE", color: "#7660A8" }}
    >
      {children}
    </span>
  );
}

function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 px-8 py-4">
      <span className="text-3xl font-bold" style={{ color: "#7660A8" }}>{value}</span>
      <span className="text-sm" style={{ color: "#7A7A85" }}>{label}</span>
    </div>
  );
}

function FeatureCard({
  icon, title, desc, color,
}: { icon: string; title: string; desc: string; color: string }) {
  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-3 border hover:shadow-lg transition-shadow duration-200"
      style={{ background: "#fff", borderColor: "#E8E8EC" }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
        style={{ background: color + "18" }}
      >
        {icon}
      </div>
      <h3 className="font-semibold text-base" style={{ color: "#0F0F12" }}>{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: "#7A7A85" }}>{desc}</p>
    </div>
  );
}

function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="flex gap-5 items-start">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5"
        style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "2px solid rgba(255,255,255,0.3)" }}
      >
        {n}
      </div>
      <div>
        <p className="font-semibold text-white">{title}</p>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>{desc}</p>
      </div>
    </div>
  );
}

/* ─── mock UI widgets ─────────────────────────────────────────────────────── */

function CopilotMock() {
  const msgs = [
    { role: "user", text: "Which meters have active leak alerts?" },
    { role: "ai",   text: "2 open alerts detected — WM-001 (critical consumption spike: 420 L/h loss) and WM-004 (acoustic anomaly: 42 L/h). Field inspection recommended for WM-001 immediately." },
    { role: "user", text: "What's today's total consumption?" },
    { role: "ai",   text: "Total consumption across all active meters is 2,039,622 kL. Distribution hub (WM-001) accounts for 68% of flow at 2.8 L/s." },
  ];
  return (
    <div
      className="rounded-2xl overflow-hidden shadow-xl border"
      style={{ background: "#fff", borderColor: "#E8E8EC", maxWidth: 440 }}
    >
      <div className="px-4 py-3 flex items-center gap-3 border-b" style={{ borderColor: "#E8E8EC", background: "#F8F6FB" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ background: "#7660A8" }}>💧</div>
        <span className="font-semibold text-sm" style={{ color: "#0F0F12" }}>Water Copilot</span>
        <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: "#E6F4EC", color: "#2E8B57" }}>● Online</span>
      </div>
      <div className="p-4 flex flex-col gap-3">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className="text-xs leading-relaxed px-3 py-2 rounded-xl max-w-[85%]"
              style={m.role === "user"
                ? { background: "#7660A8", color: "#fff", borderRadius: "12px 12px 2px 12px" }
                : { background: "#F2F2F4", color: "#404049", borderRadius: "12px 12px 12px 2px" }}
            >
              {m.text}
            </div>
          </div>
        ))}
        <div className="flex gap-2 mt-1">
          <div className="flex-1 rounded-lg border px-3 py-2 text-xs" style={{ borderColor: "#E8E8EC", color: "#A3A3AC" }}>Ask about your water system…</div>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs" style={{ background: "#7660A8" }}>↑</div>
        </div>
      </div>
    </div>
  );
}

function UsageMock() {
  const bars = [
    { label: "WM-001", pct: 88, kl: "48.2 kL", color: "#7660A8" },
    { label: "WM-003", pct: 66, kl: "32.0 kL", color: "#8773B5" },
    { label: "WM-004", pct: 37, kl: "18.0 kL", color: "#B0A4CE" },
    { label: "WM-002", pct: 26, kl: "12.5 kL", color: "#C9C0DE" },
    { label: "WM-005", pct: 12, kl: "6.0 kL",  color: "#E2DCEE" },
  ];
  return (
    <div
      className="rounded-2xl shadow-xl border p-5"
      style={{ background: "#fff", borderColor: "#E8E8EC", maxWidth: 400 }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="font-semibold text-sm" style={{ color: "#0F0F12" }}>Daily Consumption</span>
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#E2DCEE", color: "#7660A8" }}>Today</span>
      </div>
      <div className="flex flex-col gap-3">
        {bars.map((b) => (
          <div key={b.label} className="flex items-center gap-3">
            <span className="text-xs font-medium w-14 shrink-0" style={{ color: "#7A7A85" }}>{b.label}</span>
            <div className="flex-1 h-2 rounded-full" style={{ background: "#F2F2F4" }}>
              <div className="h-2 rounded-full" style={{ width: `${b.pct}%`, background: b.color }} />
            </div>
            <span className="text-xs w-16 text-right shrink-0" style={{ color: "#404049" }}>{b.kl}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-2" style={{ borderColor: "#E8E8EC" }}>
        {[["Total", "116.7 kL"], ["Avg Flow", "1.56 L/s"], ["Peak", "2.8 L/s"]].map(([l, v]) => (
          <div key={l} className="text-center">
            <p className="font-bold text-sm" style={{ color: "#7660A8" }}>{v}</p>
            <p className="text-xs" style={{ color: "#A3A3AC" }}>{l}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LeakMock() {
  const alerts = [
    { code: "WM-001", type: "Consumption Spike", sev: "critical", loss: "420 L/h", color: "#B3261E", bg: "#FBE9E7" },
    { code: "WM-003", type: "Pressure Drop",     sev: "high",     loss: "185 L/h", color: "#C28A00", bg: "#FBF1DC" },
    { code: "WM-004", type: "Acoustic Anomaly",  sev: "medium",   loss: "42 L/h",  color: "#2C6CB0", bg: "#E5EFF9" },
  ];
  return (
    <div
      className="rounded-2xl shadow-xl border p-5"
      style={{ background: "#fff", borderColor: "#E8E8EC", maxWidth: 420 }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="font-semibold text-sm" style={{ color: "#0F0F12" }}>Active Leak Alerts</span>
        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "#FBE9E7", color: "#B3261E" }}>2 Open · 1 Investigating</span>
      </div>
      <div className="flex flex-col gap-3">
        {alerts.map((a) => (
          <div
            key={a.code}
            className="flex items-center gap-3 px-3 py-3 rounded-xl"
            style={{ background: a.bg }}
          >
            <div className="text-lg">🚨</div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-xs" style={{ color: "#0F0F12" }}>{a.code} — {a.type}</p>
              <p className="text-xs mt-0.5" style={{ color: "#7A7A85" }}>Estimated loss: {a.loss}</p>
            </div>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize shrink-0"
              style={{ background: a.color + "20", color: a.color }}
            >
              {a.sev}
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs mt-4 text-center" style={{ color: "#A3A3AC" }}>
        AI-detected · Auto-classified · Geo-mapped
      </p>
    </div>
  );
}

function QualityMock() {
  const metrics = [
    { label: "pH Level",     value: "7.2",  unit: "",      ok: true,  range: "6.5–8.5" },
    { label: "Turbidity",    value: "1.8",  unit: " NTU",  ok: true,  range: "≤ 4.0" },
    { label: "Chlorine",     value: "0.8",  unit: " mg/L", ok: true,  range: "0.2–4.0" },
    { label: "Temperature",  value: "22.0", unit: " °C",   ok: true,  range: "Ref only" },
  ];
  return (
    <div
      className="rounded-2xl shadow-xl border p-5"
      style={{ background: "#fff", borderColor: "#E8E8EC", maxWidth: 380 }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="font-semibold text-sm" style={{ color: "#0F0F12" }}>WM-001 Quality Reading</span>
        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "#E6F4EC", color: "#2E8B57" }}>✓ Compliant</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-xl p-3"
            style={{ background: m.ok ? "#F8F6FB" : "#FBE9E7" }}
          >
            <div className="flex items-start justify-between">
              <span className="text-xs" style={{ color: "#7A7A85" }}>{m.label}</span>
              <span className="text-xs" style={{ color: m.ok ? "#2E8B57" : "#B3261E" }}>
                {m.ok ? "✓" : "✗"}
              </span>
            </div>
            <p className="font-bold text-lg mt-1" style={{ color: "#0F0F12" }}>
              {m.value}<span className="text-sm font-normal">{m.unit}</span>
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#A3A3AC" }}>Range: {m.range}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t flex items-center gap-2" style={{ borderColor: "#E8E8EC" }}>
        <div className="w-2 h-2 rounded-full" style={{ background: "#2E8B57" }} />
        <span className="text-xs" style={{ color: "#7A7A85" }}>18/20 readings compliant this month</span>
      </div>
    </div>
  );
}

/* ─── PAGE ────────────────────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div style={{ fontFamily: "'Poppins', system-ui, sans-serif", color: "#0F0F12" }}>

      {/* ── NAVBAR ── */}
      <nav
        className="sticky top-0 z-50 border-b"
        style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)", borderColor: "#E8E8EC" }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-sm"
              style={{ background: "#7660A8" }}
            >
              💧
            </div>
            <span className="font-bold text-lg" style={{ color: "#0F0F12" }}>DClaw Water</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: "#7A7A85" }}>
            <a href="#features" className="hover:text-[#7660A8] transition-colors">Features</a>
            <a href="#monitoring" className="hover:text-[#7660A8] transition-colors">Monitoring</a>
            <a href="#ai" className="hover:text-[#7660A8] transition-colors">AI Copilot</a>
            <a href="#how" className="hover:text-[#7660A8] transition-colors">How It Works</a>
            <Link href="/demo" className="hover:text-[#7660A8] transition-colors">Watch Demo</Link>
          </div>
          <NavCTA />
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #4A3878 0%, #7660A8 50%, #8773B5 100%)" }}
      >
        {/* grid texture */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* glow blobs */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20" style={{ background: "#B0A4CE", filter: "blur(80px)" }} />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-20" style={{ background: "#C9C0DE", filter: "blur(60px)" }} />

        <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-32">
          <div className="max-w-2xl">
            <div className="mb-6">
              <Badge>✦ AI-Powered Water Intelligence</Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
              Smart Water<br />
              <span style={{ color: "#C9C0DE" }}>Management</span><br />
              for the Future
            </h1>
            <p className="mt-6 text-lg leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
              Monitor consumption in real-time, detect leaks before they escalate, ensure water quality compliance — and ask your AI copilot anything about your infrastructure.
            </p>
            <HeroCTA />
          </div>
        </div>

        {/* floating dashboard preview */}
        <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 w-[400px]">
          <div
            className="rounded-2xl shadow-2xl border overflow-hidden"
            style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", borderColor: "rgba(255,255,255,0.15)" }}
          >
            <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#FF5F57" }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#FFBD2E" }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#28CA41" }} />
              </div>
              <span className="text-xs ml-2" style={{ color: "rgba(255,255,255,0.5)" }}>DClaw Water — Dashboard</span>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {[
                ["Total Meters", "6", "#E2DCEE", "#7660A8"],
                ["Open Alerts", "2", "#FBE9E7", "#B3261E"],
                ["Compliance", "90%", "#E6F4EC", "#2E8B57"],
                ["Flow Rate", "1.6 L/s", "#E5EFF9", "#2C6CB0"],
              ].map(([label, val, bg, col]) => (
                <div key={label} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</p>
                  <p className="font-bold text-xl mt-1 text-white">{val}</p>
                </div>
              ))}
            </div>
            <div className="px-4 pb-4">
              <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.06)" }}>
                <p className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>Consumption — Last 7 days</p>
                <div className="flex items-end gap-1 h-10">
                  {[40, 55, 45, 70, 60, 80, 65].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: i === 5 ? "#fff" : "rgba(255,255,255,0.25)" }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pb-16" />
      </section>

      {/* ── STATS BAR ── */}
      <section className="border-y" style={{ borderColor: "#E8E8EC", background: "#fff" }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-wrap justify-center divide-x divide-gray-200">
            <StatPill value="6" label="Meters Managed" />
            <StatPill value="360+" label="Daily Readings" />
            <StatPill value="5" label="Alerts Detected" />
            <StatPill value="90%" label="Quality Compliance" />
            <StatPill value="2 M+" label="kL Tracked" />
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section id="features" style={{ background: "#F8F6FB" }} className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <Badge>✦ Platform Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mt-4" style={{ color: "#0F0F12" }}>
              Everything you need to manage water
            </h2>
            <p className="mt-4 max-w-xl mx-auto text-base" style={{ color: "#7A7A85" }}>
              A complete operational platform that connects your physical meters to real-time intelligence and AI-driven insights.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <FeatureCard
              icon="🤖"
              color="#7660A8"
              title="AI Water Copilot"
              desc="Ask natural-language questions about your infrastructure. Get instant answers about consumption, leaks, and quality."
            />
            <FeatureCard
              icon="📊"
              color="#2C6CB0"
              title="Usage Monitoring"
              desc="Track real-time flow rates, pressure, and cumulative consumption across all meters with 30-day history."
            />
            <FeatureCard
              icon="🔴"
              color="#B3261E"
              title="Leak Detection"
              desc="Automated anomaly detection using consumption spikes, pressure drops, and acoustic sensor data."
            />
            <FeatureCard
              icon="🧪"
              color="#2E8B57"
              title="Quality Monitoring"
              desc="Continuous pH, turbidity, and chlorine compliance tracking against WHO and EPA standards."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-5">
            <FeatureCard
              icon="📍"
              color="#C28A00"
              title="Geo-Mapped Meters"
              desc="All meters plotted with GPS coordinates — visualize your network topology and locate incidents instantly."
            />
            <FeatureCard
              icon="⚡"
              color="#7660A8"
              title="Real-Time Alerts"
              desc="Multi-severity alert system (low → critical) with status tracking: open, investigating, resolved."
            />
            <FeatureCard
              icon="📋"
              color="#2C6CB0"
              title="Unified Dashboard"
              desc="Single pane of glass for all metrics — active meters, alert counts, top consumers, and compliance rate."
            />
          </div>
        </div>
      </section>

      {/* ── DEEP DIVE: AI COPILOT ── */}
      <section id="ai" className="py-24" style={{ background: "#fff" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <Badge>✦ AI-Powered</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mt-4" style={{ color: "#0F0F12" }}>
                Ask your water<br />system anything
              </h2>
              <p className="mt-5 text-base leading-relaxed" style={{ color: "#7A7A85" }}>
                The Water Copilot understands your entire infrastructure — meters, readings, alerts, quality data — and responds with context-aware answers in plain language.
              </p>
              <ul className="mt-6 flex flex-col gap-3">
                {[
                  "Identify open leaks and estimated water loss",
                  "Summarize consumption trends across zones",
                  "Flag non-compliant quality readings",
                  "Recommend maintenance priorities",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm" style={{ color: "#404049" }}>
                    <span className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs text-white" style={{ background: "#7660A8" }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-center md:justify-end">
              <CopilotMock />
            </div>
          </div>
        </div>
      </section>

      {/* ── DEEP DIVE: USAGE MONITORING ── */}
      <section id="monitoring" className="py-24" style={{ background: "#F8F6FB" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="flex justify-center md:justify-start order-2 md:order-1">
              <UsageMock />
            </div>
            <div className="order-1 md:order-2">
              <Badge>✦ Usage Monitoring</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mt-4" style={{ color: "#0F0F12" }}>
                Every litre,<br />accounted for
              </h2>
              <p className="mt-5 text-base leading-relaxed" style={{ color: "#7A7A85" }}>
                Dual readings per day (morning + evening) capture consumption patterns. Spot inefficiencies, compare zones, and track cumulative usage across your full network.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  ["Flow Rate", "L/s per meter"],
                  ["Pressure", "Bar monitoring"],
                  ["30-Day History", "Trend analysis"],
                  ["Top Consumers", "Zone ranking"],
                ].map(([title, sub]) => (
                  <div key={title} className="rounded-xl p-4 border" style={{ background: "#fff", borderColor: "#E8E8EC" }}>
                    <p className="font-semibold text-sm" style={{ color: "#0F0F12" }}>{title}</p>
                    <p className="text-xs mt-1" style={{ color: "#A3A3AC" }}>{sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DEEP DIVE: LEAK DETECTION ── */}
      <section className="py-24" style={{ background: "#fff" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <Badge>✦ Leak Detection</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mt-4" style={{ color: "#0F0F12" }}>
                Detect leaks before<br />they become crises
              </h2>
              <p className="mt-5 text-base leading-relaxed" style={{ color: "#7A7A85" }}>
                Three detection methods work in concert: consumption spike analysis, pressure monitoring, and acoustic sensor data. Every alert is auto-classified by type and severity.
              </p>
              <div className="mt-8 flex flex-col gap-3">
                {[
                  { icon: "📈", title: "Consumption Spike", desc: "Detects flow anomalies 30%+ above baseline" },
                  { icon: "⬇️", title: "Pressure Drop",     desc: "Monitors bar-level drops indicating pipe failure" },
                  { icon: "🔊", title: "Acoustic Analysis", desc: "Micro-leak vibration signatures from sensor arrays" },
                ].map((t) => (
                  <div key={t.title} className="flex gap-4 items-start p-4 rounded-xl border" style={{ borderColor: "#E8E8EC" }}>
                    <span className="text-xl">{t.icon}</span>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: "#0F0F12" }}>{t.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#7A7A85" }}>{t.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center md:justify-end">
              <LeakMock />
            </div>
          </div>
        </div>
      </section>

      {/* ── DEEP DIVE: QUALITY MONITORING ── */}
      <section className="py-24" style={{ background: "#F8F6FB" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="flex justify-center md:justify-start order-2 md:order-1">
              <QualityMock />
            </div>
            <div className="order-1 md:order-2">
              <Badge>✦ Quality Monitoring</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mt-4" style={{ color: "#0F0F12" }}>
                Water quality you<br />can trust
              </h2>
              <p className="mt-5 text-base leading-relaxed" style={{ color: "#7A7A85" }}>
                Automatic compliance checking against WHO and EPA thresholds — every reading is instantly flagged if parameters fall outside safe ranges.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-3">
                {[
                  ["pH", "6.5 – 8.5"],
                  ["Turbidity", "≤ 4.0 NTU"],
                  ["Chlorine", "0.2 – 4.0 mg/L"],
                  ["Temperature", "Reference tracking"],
                ].map(([param, range]) => (
                  <div key={param} className="rounded-xl p-3 border" style={{ background: "#fff", borderColor: "#E8E8EC" }}>
                    <p className="font-semibold text-sm" style={{ color: "#0F0F12" }}>{param}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#7660A8" }}>{range}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section
        id="how"
        className="py-24"
        style={{ background: "linear-gradient(135deg, #4A3878 0%, #7660A8 100%)" }}
      >
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
              style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)" }}
            >
              ✦ How It Works
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-4">
              Up and running in minutes
            </h2>
          </div>
          <div className="flex flex-col gap-8 max-w-lg mx-auto">
            <Step
              n="1"
              title="Connect Your Meters"
              desc="Register your physical water meters with location, type, and GPS coordinates. Supports building, zone, process, and distribution meters."
            />
            <Step
              n="2"
              title="Stream Readings"
              desc="Push meter readings via REST API. Flow rate, pressure, and cumulative consumption are captured and stored with full historical retention."
            />
            <Step
              n="3"
              title="Monitor & Act"
              desc="Leaks and quality violations are detected automatically. Your AI Copilot surfaces insights and the dashboard gives you a live operational view."
            />
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24" style={{ background: "#fff" }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div
            className="rounded-3xl px-8 py-14"
            style={{ background: "linear-gradient(135deg, #F1EEF8 0%, #E2DCEE 100%)" }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-3xl mx-auto mb-6 shadow-lg"
              style={{ background: "#7660A8" }}
            >
              💧
            </div>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#0F0F12" }}>
              Ready to take control<br />of your water network?
            </h2>
            <p className="mt-4 text-base" style={{ color: "#7A7A85" }}>
              Sign in and start monitoring — demo data is already loaded so you can explore every feature immediately.
            </p>
            <BottomCTA />
            <p className="mt-6 text-xs" style={{ color: "#A3A3AC" }}>
              Default credentials: oc@dclaw.dev / oc123
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t py-10" style={{ background: "#F8F6FB", borderColor: "#E8E8EC" }}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
              style={{ background: "#7660A8" }}
            >
              💧
            </div>
            <span className="font-semibold text-sm" style={{ color: "#0F0F12" }}>DClaw Water</span>
          </div>
          <p className="text-xs text-center" style={{ color: "#A3A3AC" }}>
            AI-powered water management platform · Built on DClaw Stack
          </p>
          <div className="flex gap-6 text-xs" style={{ color: "#7A7A85" }}>
            <Link href="/login" className="hover:text-[#7660A8] transition-colors">Sign In</Link>
            <Link href="/dashboard" className="hover:text-[#7660A8] transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
