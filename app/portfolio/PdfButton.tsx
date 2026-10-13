"use client";

import { useState } from "react";
import type { Entry, Profile } from "@/lib/portfolio/outcomes";

export default function PdfButton({ profile, entries }: { profile: Profile; entries: Entry[] }) {
  const [busy, setBusy] = useState(false);

  async function download() {
    setBusy(true);
    try {
      const { buildPortfolioPdf } = await import("./PortfolioPdf");
      const url = `${window.location.origin}/portfolio/u/${profile.learner_id}`;
      const blob = await buildPortfolioPdf(profile, entries, url);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${profile.full_name.replace(/[^\w]+/g, "-")}-Griptape-Portfolio.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    } catch (err) {
      console.error("[portfolio] pdf", err);
      alert("Couldn't make the PDF. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button className="gtp-btn gtp-btn-yellow" onClick={download} disabled={busy}>
      {busy ? "Making your PDF…" : "⬇ Download portfolio PDF"}
    </button>
  );
}
