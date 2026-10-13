import type { Metadata } from "next";
import { keywordSkills } from "@/lib/portfolio/keywords";
import { summaryFor, type Entry, type Profile } from "@/lib/portfolio/outcomes";
import DashboardClient from "../me/DashboardClient";

export const metadata: Metadata = { title: "Demo portfolio" };

// A sample learner so anyone can try the portfolio without signing up. Nothing here is saved.
const profile: Profile = {
  user_id: "demo",
  learner_id: "GT-DEMO26",
  full_name: "Aarav Mehta",
  pursuit: "building a mobile game about Bengaluru traffic",
  bio: "16, Bengaluru. I like making things people actually play.",
  city: "Bengaluru, Karnataka",
  cohort: "Learning Challenge 6",
  is_public: true,
};

const drafts: Omit<Entry, "outcomes">[] = [
  {
    id: "demo-3",
    user_id: "demo",
    title: "Shipped the playable demo",
    area: "Tech & Code",
    stage: "shipped",
    entry_date: "2026-09-28",
    hours: 30,
    what_i_did: "Put a playable build on itch.io and got 40 classmates to test it at the showcase.",
    how_i_did_it: "Fixed the collision bugs, made a QR code poster, and ran a feedback form after each play.",
    what_i_learned: "Most people quit at level 2 because it's too hard. Changing that next.",
    evidence_url: "https://itch.io",
  },
  {
    id: "demo-2",
    user_id: "demo",
    title: "Learned Unity basics",
    area: "Tech & Code",
    stage: "building",
    entry_date: "2026-08-14",
    hours: 22,
    what_i_did: "Followed tutorials and built a car that moves around a road grid.",
    how_i_did_it: "YouTube every evening, plus my champion's tips every Friday when I got stuck.",
    what_i_learned: null,
    evidence_url: null,
  },
  {
    id: "demo-1",
    user_id: "demo",
    title: "Picked my pursuit",
    area: "Tech & Code",
    stage: "started",
    entry_date: "2026-07-20",
    hours: 4,
    what_i_did: "Decided to make a game instead of an app after talking it through with my cohort.",
    how_i_did_it: null,
    what_i_learned: null,
    evidence_url: null,
  },
];

export default function DemoPortfolioPage() {
  const entries: Entry[] = drafts.map((d) => ({ ...d, outcomes: keywordSkills({ ...d, outcomes: [] }) }));
  return (
    <DashboardClient
      demo
      userId="demo"
      suggestedName=""
      initialProfile={{ ...profile, summary: summaryFor(profile, entries) }}
      initialEntries={entries}
    />
  );
}
