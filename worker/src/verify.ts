import type { Candidate, VerifiedScheme } from "./types";

const MARKETING = /\b(marketing|brand|consumer|commercial|product management|digital media|communications|fmcg)\b/i;
const GENERIC_PAGE = /\b(?:marketing internships?|marketing graduate jobs?\s*(?:&|and)\s*schemes?|all graduate jobs?|graduate careers? hub)\b/i;
const START_2027 = [
  /\b(?:start(?:ing|s)?|commenc(?:e|es|ing))\s+(?:in\s+)?(?:spring|summer|autumn|fall|winter|january|february|march|april|may|june|july|august|september|october|november|december)?\s*2027\b/i,
  /\b2027\s+(?:graduate|early careers?|intake|programme|program|cohort|class)\b/i,
  /\bclass\s+of\s+2027\b/i,
  /\b(?:spring|summer|autumn|fall|winter)\s+2027\s+start\b/i
];
const OLD_START = /\bstart(?:ing|s)?\s+(?:in\s+)?202[0-6]\b/i;

export function verify(candidate: Candidate, now = new Date()): VerifiedScheme | null {
  const combined = `${candidate.title}\n${candidate.description}\n${candidate.pageText}`.replace(/\s+/g, " ");
  if (!MARKETING.test(candidate.title) || GENERIC_PAGE.test(candidate.title) || OLD_START.test(combined)) return null;
  const match = START_2027.map(r => combined.match(r)).find(Boolean);
  if (!match) return null;
  const normalizedURL = new URL(candidate.applicationURL); normalizedURL.hash = "";
  const id = fnv1a(`${candidate.employer.toLowerCase()}|${candidate.title.toLowerCase()}|${normalizedURL}`);
  const location = candidate.location || inferLocation(combined);
  return { ...candidate, id, location, startYear: 2027, startEvidence: excerpt(combined, match.index ?? 0, match[0].length), discoveredAt: now.toISOString(), isLondon: /\blondon\b/i.test(location + " " + combined) };
}

function inferLocation(text: string): string { return /\blondon\b/i.test(text) ? "London" : /\b(?:hybrid|remote)\b/i.test(text) ? "Hybrid / Remote" : "United Kingdom" }
function excerpt(text: string, at: number, length: number): string { return text.slice(Math.max(0, at - 70), Math.min(text.length, at + length + 70)).trim() }
function fnv1a(value: string): string { let h = 0x811c9dc5; for (let i=0;i<value.length;i++){h^=value.charCodeAt(i);h=Math.imul(h,0x01000193)} return (h>>>0).toString(16).padStart(8,"0") }
