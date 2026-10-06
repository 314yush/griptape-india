import type { Metadata } from "next";
import Link from "next/link";
import { challengers, type Challenger } from "@/lib/community";
import VideoCard from "./VideoCard";
import "./community.css";

export const metadata: Metadata = {
  title: "Community",
  description:
    "Griptape India Challengers. Everyone here earned their spot. This is who you're in it with.",
};

const pad = (n: number) => String(n).padStart(2, "0");

export default function CommunityPage() {
  // Newest cohort first
  const byCohort = new Map<number, Challenger[]>();
  for (const c of challengers) {
    byCohort.set(c.cohort, [...(byCohort.get(c.cohort) ?? []), c]);
  }
  const cohorts = [...byCohort.keys()].sort((a, b) => b - a);
  const latest = cohorts[0];

  return (
    <main className="community-page">
      <nav className="community-nav">
        <Link href="/" className="community-brand">
          <img src="/griptape-mascot.png" alt="" aria-hidden="true" />
          Griptape <em>India</em>
        </Link>
        <div className="community-nav-links">
          <Link href="/blog">Magazine</Link>
          <Link href="/">Home</Link>
        </div>
      </nav>

      <header className="community-hero">
        <p className="community-eyebrow">Cohort {pad(latest)}</p>
        <h1 className="community-title">
          Challengers <span className="serif">only.</span>
        </h1>
        <p className="community-sub">
          Everyone here earned their spot. This is who you&apos;re in it with.
        </p>
        <p className="community-count">
          <strong>{byCohort.get(latest)!.length}</strong> Challengers · Cohort{" "}
          {pad(latest)}
        </p>
      </header>

      {cohorts.map((cohort) => (
        <section key={cohort} className="community-cohort" aria-label={`Cohort ${cohort}`}>
          {cohorts.length > 1 && (
            <h2 className="community-cohort-title">Cohort {pad(cohort)}</h2>
          )}
          <div className="community-grid">
            {byCohort.get(cohort)!.map((c, i) => (
              <VideoCard key={c.driveId} challenger={c} number={i + 1} />
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
