import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kazi Ready — Compliance Deadline Alerts",
  description:
    "SMS reminders for KEBS, NEMA, KRA and county compliance deadlines — built for Kenyan manufacturers on Africa's Talking.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
