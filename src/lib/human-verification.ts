import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";

export const HUMAN_VERIFICATION_PROVIDERS = {
  WORLD_ID: "WORLD_ID",
  PRIVATE_REPORTER_PROOF: "PRIVATE_REPORTER_PROOF"
} as const;

export const HUMAN_VERIFICATION_STATUSES = {
  PENDING: "PENDING",
  VERIFIED: "VERIFIED",
  FAILED: "FAILED"
} as const;

export const HUMAN_VERIFICATION_EVENT_STAGES = {
  SHOWN: "SHOWN",
  CLICKED: "CLICKED",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED"
} as const;

export const HUMAN_VERIFICATION_DEGRADED_REASONS = {
  SCHEMA_MISSING: "HUMAN_VERIFICATION_SCHEMA_MISSING"
} as const;

type HumanVerificationProvider =
  (typeof HUMAN_VERIFICATION_PROVIDERS)[keyof typeof HUMAN_VERIFICATION_PROVIDERS];

const HUMAN_VERIFICATION_SUMMARY_COOKIE = "civitas_public_human_verification";
const HUMAN_VERIFICATION_EVENTS_COOKIE = "civitas_public_human_verification_events";

export type HumanVerificationSummary = {
  isVerified: boolean;
  providers: string[];
  verifiedAt: string | null;
  degraded: boolean;
  degradedReason?: string;
  records: Array<{
    id: string;
    provider: string;
    status: string;
    verifiedAt: string | null;
    metadata: Record<string, unknown>;
  }>;
};

export type UnifiedHumanVerificationSummary = HumanVerificationSummary & {
  includesLegacyReporterVerification: boolean;
};

type TrackEventInput = {
  eventId?: string;
  userId: string;
  profileId?: string | null;
  provider?: string;
  action?: string;
  promptContext?: string;
  stage?: string;
  verificationRecordId?: string | null;
  metadata?: Record<string, unknown>;
};

function defaultSummary(): HumanVerificationSummary {
  return {
    isVerified: false,
    providers: [],
    verifiedAt: null,
    degraded: false,
    records: []
  };
}

function parseJson<T>(input: string | undefined | null, fallback: T): T {
  if (!input) return fallback;
  try {
    return JSON.parse(input) as T;
  } catch {
    return fallback;
  }
}

async function readSummary(): Promise<HumanVerificationSummary> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(HUMAN_VERIFICATION_SUMMARY_COOKIE)?.value;
  const summary = parseJson<HumanVerificationSummary | null>(raw ? decodeURIComponent(raw) : null, null);
  return summary || defaultSummary();
}

async function writeSummary(summary: HumanVerificationSummary) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: HUMAN_VERIFICATION_SUMMARY_COOKIE,
    value: encodeURIComponent(JSON.stringify(summary)),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
}

async function readEvents() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(HUMAN_VERIFICATION_EVENTS_COOKIE)?.value;
  return parseJson<Array<Record<string, unknown>>>(raw ? decodeURIComponent(raw) : null, []);
}

async function writeEvents(events: Array<Record<string, unknown>>) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: HUMAN_VERIFICATION_EVENTS_COOKIE,
    value: encodeURIComponent(JSON.stringify(events.slice(-25))),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
}

function normalizeProvider(input: string | null | undefined): HumanVerificationProvider {
  return input === HUMAN_VERIFICATION_PROVIDERS.PRIVATE_REPORTER_PROOF
    ? HUMAN_VERIFICATION_PROVIDERS.PRIVATE_REPORTER_PROOF
    : HUMAN_VERIFICATION_PROVIDERS.WORLD_ID;
}

function normalizeStage(input: string | null | undefined) {
  switch (input) {
    case HUMAN_VERIFICATION_EVENT_STAGES.CLICKED:
      return HUMAN_VERIFICATION_EVENT_STAGES.CLICKED;
    case HUMAN_VERIFICATION_EVENT_STAGES.COMPLETED:
      return HUMAN_VERIFICATION_EVENT_STAGES.COMPLETED;
    case HUMAN_VERIFICATION_EVENT_STAGES.FAILED:
      return HUMAN_VERIFICATION_EVENT_STAGES.FAILED;
    default:
      return HUMAN_VERIFICATION_EVENT_STAGES.SHOWN;
  }
}

export function isHumanVerificationSchemaMissingError() {
  return false;
}

export async function ensureHumanVerificationSchema() {
  return;
}

export async function trackHumanVerificationEvent(input: TrackEventInput) {
  const eventId = input.eventId || randomUUID();
  const provider = normalizeProvider(input.provider);
  const stage = normalizeStage(input.stage);
  const events = await readEvents();

  events.push({
    id: eventId,
    userId: input.userId,
    profileId: input.profileId || null,
    provider,
    action: String(input.action || "verify-civitas-human"),
    promptContext: String(input.promptContext || "general"),
    stage,
    verificationRecordId: input.verificationRecordId || null,
    metadata: input.metadata || {},
    createdAt: new Date().toISOString()
  });
  await writeEvents(events);

  if (stage === HUMAN_VERIFICATION_EVENT_STAGES.COMPLETED) {
    const summary = await readSummary();
    const recordId = input.verificationRecordId || eventId;
    const nextSummary: HumanVerificationSummary = {
      isVerified: true,
      providers: Array.from(new Set([...summary.providers, provider])),
      verifiedAt: new Date().toISOString(),
      degraded: false,
      records: [
        {
          id: recordId,
          provider,
          status: HUMAN_VERIFICATION_STATUSES.VERIFIED,
          verifiedAt: new Date().toISOString(),
          metadata: input.metadata || {}
        },
        ...summary.records.filter((record) => record.id !== recordId)
      ]
    };
    await writeSummary(nextSummary);
  }

  return eventId;
}

export async function getHumanVerificationSummary() {
  return readSummary();
}

export async function getUnifiedHumanVerificationSummary() {
  const summary = await readSummary();
  return {
    ...summary,
    includesLegacyReporterVerification: false
  };
}

export async function upsertHumanVerificationRecord() {
  throw new Error("Human verification records are managed locally in the public demo.");
}
