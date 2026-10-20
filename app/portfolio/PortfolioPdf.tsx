// Loaded on demand by PdfButton so react-pdf never ships in the initial bundle.
import { Circle, Document, Font, G, Link, Page, Path, Polygon, StyleSheet, Svg, Text, View, pdf } from "@react-pdf/renderer";
import { GLYPHS, SEAL, type Glyph } from "./Badge";
import {
  OUTCOME_BY_KEY,
  STAGES,
  milestones,
  badgeCount,
  projectLevels,
  outcomeProgress,
  summaryFor,
  totalHours,
  type Entry,
  type Profile,
} from "@/lib/portfolio/outcomes";

// Keep words whole (no "Collabo-ration")
Font.registerHyphenationCallback((word) => [word]);

const C = { orange: "#FF5226", yellow: "#FDB927", cream: "#FFF4E6", paper: "#FBEFD9", ink: "#141414", muted: "#6b6255" };

const s = StyleSheet.create({
  page: { backgroundColor: C.cream, padding: 36, fontFamily: "Helvetica", fontSize: 10, color: C.ink },
  band: { backgroundColor: C.orange, marginHorizontal: -36, marginTop: -36, paddingHorizontal: 36, paddingVertical: 22, marginBottom: 20, borderBottomWidth: 3, borderColor: C.ink },
  brand: { fontFamily: "Helvetica-Bold", fontSize: 10, letterSpacing: 2, color: C.ink },
  title: { fontFamily: "Helvetica-Bold", fontSize: 30, color: C.ink, marginTop: 8 },
  sub: { fontSize: 11, marginTop: 4 },
  idChip: { alignSelf: "flex-start", marginTop: 10, borderWidth: 1.5, borderColor: C.ink, backgroundColor: C.yellow, paddingHorizontal: 8, paddingVertical: 3, fontFamily: "Courier-Bold", fontSize: 10 },
  row: { flexDirection: "row" },
  stat: { flex: 1, borderWidth: 1.5, borderColor: C.ink, backgroundColor: "#fff", padding: 10, marginRight: 8 },
  statNum: { fontFamily: "Helvetica-Bold", fontSize: 20 },
  statLbl: { fontSize: 8, color: C.muted, textTransform: "uppercase", letterSpacing: 1 },
  h2: { fontFamily: "Helvetica-Bold", fontSize: 14, marginTop: 18, marginBottom: 8 },
  summary: { backgroundColor: C.paper, borderLeftWidth: 4, borderColor: C.orange, padding: 10 },
  badge: { width: "16.66%", alignItems: "center", marginBottom: 8 },
  badgeName: { fontFamily: "Helvetica-Bold", fontSize: 8, textAlign: "center", marginTop: 4 },
  badgeTier: { fontSize: 7, color: C.muted, textAlign: "center" },
  entry: { borderWidth: 1.5, borderColor: C.ink, backgroundColor: "#fff", padding: 12, marginBottom: 10 },
  entryTitle: { fontFamily: "Helvetica-Bold", fontSize: 12 },
  entryMeta: { fontSize: 8, color: C.muted, marginTop: 3, marginBottom: 6 },
  label: { fontFamily: "Helvetica-Bold", fontSize: 8, textTransform: "uppercase", letterSpacing: 1, marginTop: 6, marginBottom: 2, color: C.muted },
  body: { lineHeight: 1 },
  pill: { fontSize: 7, borderWidth: 1, borderColor: C.ink, paddingHorizontal: 5, paddingVertical: 2, marginRight: 4, marginTop: 6 },
  footer: { position: "absolute", bottom: 18, left: 36, right: 36, flexDirection: "row", justifyContent: "space-between", fontSize: 7, color: C.muted },
});

function PdfBadge({ glyph, color, locked, tier }: { glyph: Glyph; color: string; locked: boolean; tier: number }) {
  const line = locked ? "#b9ab95" : C.ink;
  return (
    <Svg width={50} height={50} viewBox="0 0 100 100">
      <Polygon points={SEAL} fill={locked ? C.paper : color} stroke={C.ink} strokeWidth={2.5} />
      <Circle cx={50} cy={50} r={27} fill={locked ? C.paper : C.cream} stroke={C.ink} strokeWidth={2} />
      <G>
        {GLYPHS[glyph].map((sh, i) =>
          "d" in sh ? (
            <Path key={i} d={sh.d} stroke={line} strokeWidth={sh.w ?? 4.5} strokeLinecap="round" strokeLinejoin="round" fill={sh.fill ? line : "none"} fillOpacity={sh.fill ? 0.22 : 0} />
          ) : (
            <Circle key={i} cx={sh.cx} cy={sh.cy} r={sh.r} stroke={line} strokeWidth={4.5} fill="none" />
          )
        )}
      </G>
      {Array.from({ length: !locked && tier > 0 ? tier : 0 }).map((_, i) => (
        <Circle key={`t${i}`} cx={50 + (i - (tier - 1) / 2) * 9} cy={88} r={3.6} fill={C.yellow} stroke={C.ink} strokeWidth={1.8} />
      ))}
    </Svg>
  );
}

function PortfolioDoc({ profile, entries, url }: { profile: Profile; entries: Entry[]; url: string }) {
  const progress = outcomeProgress(entries);
  const marks = milestones(entries).filter((m) => m.earned);
  const badges = badgeCount(entries);
  const levels = projectLevels(entries);
  const generated = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return (
    <Document title={`${profile.full_name} — Griptape Portfolio`} author={profile.full_name} creator="Griptape India">
      <Page size="A4" style={s.page} wrap>
        <View style={s.band}>
          <Text style={s.brand}>GRIPTAPE INDIA · LEARNER PORTFOLIO</Text>
          <Text style={s.title}>{profile.full_name}</Text>
          {profile.pursuit ? <Text style={s.sub}>Chasing: {profile.pursuit}</Text> : null}
          <Text style={s.sub}>{[profile.city, profile.cohort].filter(Boolean).join("  ·  ")}</Text>
          <Text style={s.idChip}>ID {profile.learner_id}</Text>
        </View>

        {profile.bio ? <Text style={[s.body, { marginBottom: 12 }]}>{profile.bio}</Text> : null}

        <View style={s.row}>
          <View style={s.stat}>
            <Text style={s.statNum}>{Math.round(totalHours(entries))}</Text>
            <Text style={s.statLbl}>Hours invested</Text>
          </View>
          <View style={s.stat}>
            <Text style={s.statNum}>{entries.filter((e) => e.stage === "shipped").length}</Text>
            <Text style={s.statLbl}>Shipped</Text>
          </View>
          <View style={[s.stat, { marginRight: 0, backgroundColor: C.yellow }]}>
            <Text style={s.statNum}>{badges}</Text>
            <Text style={s.statLbl}>Badges earned</Text>
          </View>
        </View>

        <Text style={s.h2}>Summary</Text>
        <View style={s.summary}>
          <Text style={s.body}>{profile.summary || summaryFor(profile, entries)}</Text>
        </View>

        <Text style={s.h2}>Project badges</Text>
        <View style={[s.row, { flexWrap: "wrap" }]}>
          {levels.map((l) => (
            <View key={l.level} style={s.badge}>
              <PdfBadge glyph={l.glyph} color={l.color} locked={!l.earned} tier={0} />
              <Text style={s.badgeName}>{l.name}</Text>
              <Text style={s.badgeTier}>{l.earned ? `Level ${l.level}` : `${l.at} projects`}</Text>
            </View>
          ))}
        </View>

        <Text style={s.h2}>Skill badges</Text>
        <View style={[s.row, { flexWrap: "wrap" }]}>
          {progress.map((p) => (
            <View key={p.outcome.key} style={s.badge}>
              <PdfBadge glyph={p.outcome.key} color={p.outcome.color} locked={p.tier === 0} tier={p.tier} />
              <Text style={s.badgeName}>{p.outcome.name}</Text>
              <Text style={s.badgeTier}>{p.tierName ? `×${p.count} · ${p.tierName}` : "Not yet"}</Text>
            </View>
          ))}
        </View>
        {marks.length ? (
          <Text style={[s.body, { fontSize: 9 }]}>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>Milestones: </Text>
            {marks.map((m) => m.name).join("  ·  ")}
          </Text>
        ) : null}

        <Text style={s.h2} break={entries.length > 0}>
          What I did, and how I did it
        </Text>
        {entries.length === 0 ? <Text style={s.body}>No entries yet.</Text> : null}
        {entries.map((e) => (
          <View key={e.id} style={s.entry} wrap={false}>
            <Text style={s.entryTitle}>{e.title}</Text>
            <Text style={s.entryMeta}>
              {[new Date(e.entry_date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }), `${Number(e.hours)} hours`, e.area, STAGES[e.stage]]
                .filter(Boolean)
                .join("  ·  ")}
            </Text>
            <Text style={s.body}>{e.what_i_did}</Text>
            {e.how_i_did_it ? (
              <>
                <Text style={s.label}>How I did it</Text>
                <Text style={s.body}>{e.how_i_did_it}</Text>
              </>
            ) : null}
            {e.what_i_learned ? (
              <>
                <Text style={s.label}>What I learned</Text>
                <Text style={s.body}>{e.what_i_learned}</Text>
              </>
            ) : null}
            {e.evidence_url ? (
              <Link src={e.evidence_url} style={{ fontSize: 8, color: C.orange, marginTop: 6 }}>
                Proof: {e.evidence_url}
              </Link>
            ) : null}
            {e.outcomes?.length ? (
              <View style={[s.row, { flexWrap: "wrap" }]}>
                {e.outcomes.map((k) =>
                  OUTCOME_BY_KEY[k] ? (
                    <Text key={k} style={[s.pill, { backgroundColor: OUTCOME_BY_KEY[k].color }]}>
                      {OUTCOME_BY_KEY[k].name}
                    </Text>
                  ) : null
                )}
              </View>
            ) : null}
          </View>
        ))}

        <View style={s.footer} fixed>
          <Text>Generated {generated} · Verify at {url}</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

export async function buildPortfolioPdf(profile: Profile, entries: Entry[], url: string) {
  return pdf(<PortfolioDoc profile={profile} entries={entries} url={url} />).toBlob();
}
