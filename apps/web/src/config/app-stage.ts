export const APP_STAGES = [
  "building",
  "experimental",
  "alpha",
  "beta",
  "live",
] as const;

export type AppStage = (typeof APP_STAGES)[number];

const DEFAULT_STAGE: AppStage = "experimental";

/**
 * Set `NEXT_PUBLIC_APP_STAGE` to one of: building | experimental | alpha | beta | live
 * (public env — inlined at build time).
 */
export function getAppStage(): AppStage {
  const raw = process.env.NEXT_PUBLIC_APP_STAGE?.toLowerCase().trim();
  if (raw && (APP_STAGES as readonly string[]).includes(raw)) {
    return raw as AppStage;
  }
  return DEFAULT_STAGE;
}
