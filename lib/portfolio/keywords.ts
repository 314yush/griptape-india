// Keyword-based skill detection. Used as the fallback when Claude isn't available, and by the demo page.
import { OUTCOMES, type Entry, type OutcomeKey } from "./outcomes";

const KEYWORDS: Record<OutcomeKey, RegExp> = {
  agency: /\b(decided|chose|started|launched|organi[sz]ed|led|took (the )?(lead|initiative|charge)|on my own|by myself|my own|reached out|asked|set up|planned|pitched)\w*/i,
  critical: /\b(test|tested|tried|changed|feedback|research|compare|question|analy[sz]|improv|iterat|mistake|realis|realiz|learned|why)\w*/i,
  grit: /\b(again|kept|keep going|practi[cs]e|every day|daily|weeks?|months?|despite|hard|difficult|failed|retry|didn'?t give up|stuck with)\w*/i,
  problem: /\b(fix|solv|bug|problem|figured out|workaround|solution|stuck|broke|issue|debug|sorted)\w*/i,
  communication: /\b(present|pitch|post|posted|shared|wrote|explain|showcase|video|instagram|youtube|talk|told|blog|demo|poster)\w*/i,
};

export function keywordSkills(e: Entry): OutcomeKey[] {
  const text = [e.title, e.what_i_did, e.how_i_did_it, e.what_i_learned].filter(Boolean).join(" ");
  const found = OUTCOMES.map((o) => o.key).filter((k) => KEYWORDS[k].test(text));
  if (e.stage === "shipped" && !found.includes("communication")) found.push("communication");
  if (Number(e.hours) >= 10 && !found.includes("grit")) found.push("grit");
  // Every logged piece of work earns at least one skill
  return found.length ? found : ["grit"];
}
