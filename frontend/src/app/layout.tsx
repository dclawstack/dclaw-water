import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "DClaw Water",
  description: "AI-powered water management platform",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>{children}</body>
    </html>
  )
}
