export type WorldIdEnvironment = "staging" | "production";

const DEFAULT_WORLD_ID_ENVIRONMENT: WorldIdEnvironment = "staging";
const ALLOWED_ENVIRONMENTS = new Set<WorldIdEnvironment>(["staging", "production"]);

type WorldIdEnvironmentResolution = {
  environment: WorldIdEnvironment;
  valid: boolean;
  rawValue: string | null;
};

let hasLoggedInvalidServerEnvironment = false;

function normalizeWorldIdEnvironment(value: string | null | undefined): WorldIdEnvironmentResolution {
  const rawValue = String(value || "").trim();
  const normalized = rawValue.toLowerCase();

  if (!rawValue) {
    return {
      environment: DEFAULT_WORLD_ID_ENVIRONMENT,
      valid: true,
      rawValue: null
    };
  }

  if (ALLOWED_ENVIRONMENTS.has(normalized as WorldIdEnvironment)) {
    return {
      environment: normalized as WorldIdEnvironment,
      valid: true,
      rawValue
    };
  }

  return {
    environment: DEFAULT_WORLD_ID_ENVIRONMENT,
    valid: false,
    rawValue
  };
}

export function getServerWorldIdEnvironment() {
  const resolution = normalizeWorldIdEnvironment(
    process.env.WORLD_ID_ENVIRONMENT || process.env.NEXT_PUBLIC_WORLD_ID_ENVIRONMENT
  );

  if (!resolution.valid && !hasLoggedInvalidServerEnvironment) {
    hasLoggedInvalidServerEnvironment = true;
    console.warn(
      `[world-id] invalid WORLD_ID_ENVIRONMENT="${resolution.rawValue}". Falling back to "${DEFAULT_WORLD_ID_ENVIRONMENT}".`
    );
  }

  return resolution;
}

export function getClientWorldIdEnvironment() {
  const resolution = normalizeWorldIdEnvironment(process.env.NEXT_PUBLIC_WORLD_ID_ENVIRONMENT);
  return resolution.environment;
}
