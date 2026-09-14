export interface Env { DB: D1Database; ADMIN_TOKEN?: string; USER_AGENT: string }
export interface Source { name: string; url: string; employer?: string }
export interface Candidate { employer: string; title: string; location: string; description: string; applicationURL: string; sourceURL: string; sourceName: string; pageText: string; openedAt?: string; deadline?: string }
export interface VerifiedScheme extends Candidate { id: string; startYear: 2027; startEvidence: string; discoveredAt: string; isLondon: boolean }

