"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function NavCTA() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem("access_token"));
  }, []);

  if (loggedIn) {
    return (
      <Link
        href="/dashboard"
        className="text-sm font-semibold px-5 py-2 rounded-xl text-white transition-opacity hover:opacity-90"
        style={{ background: "#7660A8" }}
      >
        Go to Dashboard →
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      className="text-sm font-semibold px-5 py-2 rounded-xl text-white transition-opacity hover:opacity-90"
      style={{ background: "#7660A8" }}
    >
      Sign In →
    </Link>
  );
}

export function HeroCTA() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem("access_token"));
  }, []);

  const primary = loggedIn ? { href: "/dashboard", label: "Go to Dashboard →" } : { href: "/login", label: "Get Started Free →" };

  return (
    <div className="mt-10 flex flex-wrap gap-4">
      <Link
        href={primary.href}
        className="px-7 py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 shadow-lg"
        style={{ background: "#fff", color: "#7660A8" }}
      >
        {primary.label}
      </Link>
      <a
        href="#features"
        className="px-7 py-3.5 rounded-xl font-semibold text-sm border transition-all hover:bg-white/10"
        style={{ color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}
      >
        Explore Features
      </a>
    </div>
  );
}

export function BottomCTA() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem("access_token"));
  }, []);

  return (
    <div className="mt-8 flex flex-wrap gap-4 justify-center">
      <Link
        href={loggedIn ? "/dashboard" : "/login"}
        className="px-8 py-3.5 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 shadow-lg"
        style={{ background: "#7660A8" }}
      >
        {loggedIn ? "Go to Dashboard →" : "Sign In to Dashboard →"}
      </Link>
      <a
        href="#features"
        className="px-8 py-3.5 rounded-xl font-semibold text-sm border transition-all hover:bg-white/60"
        style={{ color: "#7660A8", borderColor: "#7660A8" }}
      >
        View Features
      </a>
    </div>
  );
}
