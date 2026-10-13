// Skill badges, based on the skills Reap Benefit uses on Solve Ninja profiles.
// (Code calls them "outcomes"; the DB column is portfolio_entries.outcomes.)
// Edit names, prompts or thresholds here; the dashboard, public profile and PDF all read from this file.

export type OutcomeKey =
  | "critical"
  | "grit"
  | "problem"
  | "community"
  | "communication"
  | "citizenship";

export type Outcome = {
  key: OutcomeKey;
  name: string;
  short: string;
  /** Question shown when a learner tags an entry with this skill. */
  prompt: string;
  color: string;
};

export const OUTCOMES: Outcome[] = [
  { key: "critical", name: "Critical Thinking", short: "I question & adapt", prompt: "Did you question an idea, test it, and change course?", color: "#7FC8A9" },
  { key: "grit", name: "Grit", short: "I keep going", prompt: "Did you keep going when it got hard, slow or boring?", color: "#C3A6F2" },
  { key: "problem", name: "Problem Solving", short: "I find a way", prompt: "Did you figure out a way around something blocking you?", color: "#FDB927" },
  { key: "community", name: "Community Collaboration", short: "I work with my people", prompt: "Did you work with others: your cohort, champion, or people you met?", color: "#F4A8B8" },
  { key: "communication", name: "Communication", short: "I share my work", prompt: "Did you pitch, present, write or explain your work to someone?", color: "#5EC4C9" },
  { key: "citizenship", name: "Citizenship", short: "I show up for others", prompt: "Did your work help people or a place beyond yourself?", color: "#FF9F6B" },
];

export const OUTCOME_BY_KEY = Object.fromEntries(OUTCOMES.map((o) => [o.key, o])) as Record<
  OutcomeKey,
  Outcome
>;

/** Skill levels, L1 to L5, by how many entries used the skill. */
export const TIERS = [
  { level: 1, name: "Level 1", at: 1 },
  { level: 2, name: "Level 2", at: 3 },
  { level: 3, name: "Level 3", at: 5 },
  { level: 4, name: "Level 4", at: 8 },
  { level: 5, name: "Level 5", at: 12 },
] as const;

export const AREAS = [
  "Art & Design",
  "Tech & Code",
  "Music & Performance",
  "Writing & Media",
  "Sport & Movement",
  "Business & Making Money",
  "Science & Research",
  "Community & Social Impact",
  "Something else",
];

export const STAGES = {
  started: "Started something new",
  building: "Built it up",
  shipped: "Shipped / showcased",
} as const;
export type Stage = keyof typeof STAGES;

export type Entry = {
  id: string;
  user_id: string;
  title: string;
  area: string | null;
  stage: Stage;
  entry_date: string;
  hours: number;
  what_i_did: string;
  how_i_did_it: string | null;
  what_i_learned: string | null;
  evidence_url: string | null;
  outcomes: OutcomeKey[];
};

export type Profile = {
  user_id: string;
  learner_id: string;
  full_name: string;
  pursuit: string | null;
  bio: string | null;
  city: string | null;
  cohort: string | null;
  is_public: boolean;
  summary?: string | null;
};

export type OutcomeProgress = {
  outcome: Outcome;
  count: number;
  tier: number; // 0 = locked
  tierName: string | null;
  next: number | null; // tags needed for next tier
};

export type Milestone = {
  key: string;
  name: string;
  detail: string;
  earned: boolean;
  glyph: "first" | "hours" | "ship" | "all" | "streak";
};

export function outcomeProgress(entries: Entry[]): OutcomeProgress[] {
  return OUTCOMES.map((outcome) => {
    const count = entries.filter((e) => e.outcomes?.includes(outcome.key)).length;
    const reached = TIERS.filter((t) => count >= t.at);
    const top = reached[reached.length - 1];
    const nextTier = TIERS.find((t) => count < t.at);
    return {
      outcome,
      count,
      tier: top?.level ?? 0,
      tierName: top?.name ?? null,
      next: nextTier ? nextTier.at - count : null,
    };
  });
}

export function totalHours(entries: Entry[]) {
  return entries.reduce((sum, e) => sum + Number(e.hours || 0), 0);
}

/** Distinct calendar months with at least one entry, counted back from the latest. */
function monthStreak(entries: Entry[]) {
  const months = new Set(entries.map((e) => e.entry_date.slice(0, 7)));
  if (!months.size) return 0;
  const latest = [...months].sort().pop()!;
  let [y, m] = latest.split("-").map(Number);
  let streak = 0;
  while (months.has(`${y}-${String(m).padStart(2, "0")}`)) {
    streak++;
    m--;
    if (m === 0) {
      m = 12;
      y--;
    }
  }
  return streak;
}

export function milestones(entries: Entry[]): Milestone[] {
  const hours = totalHours(entries);
  const progress = outcomeProgress(entries);
  return [
    {
      key: "first",
      name: "First Mark",
      detail: "Logged your first entry",
      earned: entries.length >= 1,
      glyph: "first",
    },
    {
      key: "hours25",
      name: "25 Hours In",
      detail: "Put 25 hours into your pursuit",
      earned: hours >= 25,
      glyph: "hours",
    },
    {
      key: "hours100",
      name: "100 Hour Club",
      detail: "Put 100 hours into your pursuit",
      earned: hours >= 100,
      glyph: "hours",
    },
    {
      key: "shipped",
      name: "Shipped It",
      detail: "Showcased or shipped something",
      earned: entries.some((e) => e.stage === "shipped"),
      glyph: "ship",
    },
    {
      key: "streak",
      name: "3-Month Streak",
      detail: "Logged work three months running",
      earned: monthStreak(entries) >= 3,
      glyph: "streak",
    },
    {
      key: "all",
      name: "Full Grip",
      detail: "Used every skill at least once",
      earned: progress.every((p) => p.tier > 0),
      glyph: "all",
    },
  ];
}

/** Points that drive the level bar: effort (hours), reflection (outcome tags) and shipping. */
export function gripPoints(entries: Entry[]) {
  return Math.round(
    entries.reduce(
      (pts, e) =>
        pts + 10 + Math.min(Number(e.hours || 0), 200) + 5 * (e.outcomes?.length ?? 0) + (e.stage === "shipped" ? 25 : 0),
      0
    )
  );
}

export const LEVELS = [
  { name: "Curious", at: 0 },
  { name: "Explorer", at: 60 },
  { name: "Maker", at: 180 },
  { name: "Builder", at: 400 },
  { name: "Trailblazer", at: 800 },
];

export function levelFor(points: number) {
  let idx = 0;
  LEVELS.forEach((l, i) => {
    if (points >= l.at) idx = i;
  });
  const current = LEVELS[idx];
  const next = LEVELS[idx + 1] ?? null;
  const pct = next ? Math.min(100, ((points - current.at) / (next.at - current.at)) * 100) : 100;
  return { level: idx + 1, name: current.name, next, pct };
}

function joinList(items: string[]) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** The short narrative at the top of a profile, like a mentor's summary. */
export function summaryFor(profile: Profile, entries: Entry[]) {
  const first = profile.full_name.split(" ")[0];
  if (!entries.length) {
    return `${first} is just getting started${profile.pursuit ? ` on ${profile.pursuit}` : ""}. Their first entry will show up here.`;
  }
  const hours = Math.round(totalHours(entries));
  const areas = [...new Set(entries.map((e) => e.area).filter(Boolean))] as string[];
  const strongest = outcomeProgress(entries)
    .filter((p) => p.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 2)
    .map((p) => p.outcome.name.toLowerCase());
  const shipped = entries.filter((e) => e.stage === "shipped").length;

  const parts = [
    `${first} is chasing ${profile.pursuit || "a pursuit they chose"}${areas.length ? `, working across ${joinList(areas.slice(0, 3).map((a) => a.toLowerCase()))}` : ""}.`,
    `So far they've logged ${entries.length} ${entries.length === 1 ? "entry" : "entries"} and put in ${hours} ${hours === 1 ? "hour" : "hours"}${shipped ? `, and shipped ${shipped} ${shipped === 1 ? "thing" : "things"} for others to see` : ""}.`,
  ];
  if (strongest.length)
    parts.push(
      strongest.length === 1
        ? `The skill they use most is ${strongest[0]}.`
        : `The skills they use most are ${joinList(strongest)}.`
    );
  return parts.join(" ");
}
