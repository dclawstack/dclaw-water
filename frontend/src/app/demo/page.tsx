import Link from "next/link";

export default function DemoPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
      style={{ background: "linear-gradient(135deg, #F8F6FB 0%, #E2DCEE 100%)" }}
    >
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-sm"
              style={{ background: "#7660A8" }}
            >
              💧
            </div>
            <span className="font-bold text-lg" style={{ color: "#0F0F12" }}>DClaw Water</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold" style={{ color: "#0F0F12" }}>
            30-Second Product Demo
          </h1>
          <p className="mt-3 text-base" style={{ color: "#7A7A85" }}>
            See the full platform in action — landing page → login → dashboard → leak alerts → quality monitoring → AI Copilot
          </p>
        </div>

        {/* Video player */}
        <div
          className="rounded-2xl overflow-hidden shadow-2xl border"
          style={{ borderColor: "#C9C0DE" }}
        >
          <video
            src="/demo.webm"
            controls
            autoPlay
            muted
            loop
            playsInline
            className="w-full"
            style={{ display: "block", background: "#0F0F12" }}
          />
        </div>

        {/* Feature tags */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {[
            "🏠 Landing Page",
            "🔐 Authentication",
            "📊 Live Dashboard",
            "📟 Meter Management",
            "🔴 Leak Detection",
            "🧪 Quality Monitoring",
            "🤖 AI Copilot",
          ].map((tag) => (
            <span
              key={tag}
              className="text-sm px-4 py-1.5 rounded-full font-medium"
              style={{ background: "#fff", color: "#7660A8", border: "1px solid #C9C0DE" }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="flex justify-center gap-4 mt-10">
          <Link
            href="/login"
            className="px-7 py-3 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90 shadow-md"
            style={{ background: "#7660A8" }}
          >
            Try It Live →
          </Link>
          <Link
            href="/"
            className="px-7 py-3 rounded-xl font-semibold text-sm border transition-colors hover:bg-white"
            style={{ color: "#7660A8", borderColor: "#7660A8" }}
          >
            Back to Landing
          </Link>
        </div>
      </div>
    </div>
  );
}
