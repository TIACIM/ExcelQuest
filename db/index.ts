import { neon } from '@neondatabase/serverless';

export type Role = 'superadmin' | 'admin' | 'manager' | 'collaborator';

export type ProgressPayload = {
  completed: number[];
  flawless: number[];
  moduleTests: number[];
  xp: number;
  studyDates: string[];
  bestStreak: number;
  mistakes: number[];
};

export const emptyProgress: ProgressPayload = {
  completed: [], flawless: [], moduleTests: [], xp: 0, studyDates: [], bestStreak: 0, mistakes: [],
};

export function getSql() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL não está configurada.');
  return neon(connectionString);
}

export function dbQuery(text: string, params: unknown[] = []) {
  return getSql().query(text, params);
}

export function normaliseProgress(value: unknown): ProgressPayload | null {
  if (!value || typeof value !== 'object') return null;
  const input = value as Record<string, unknown>;
  const ids = (inputValue: unknown, max = 35) => Array.isArray(inputValue)
    ? [...new Set(inputValue.filter((id): id is number => Number.isInteger(id) && id >= 1 && id <= max))].sort((a, b) => a - b)
    : null;
  const completed = ids(input.completed);
  const flawless = ids(input.flawless);
  const moduleTests = ids(input.moduleTests, 7);
  const mistakes = ids(input.mistakes);
  const studyDates = Array.isArray(input.studyDates)
    ? [...new Set(input.studyDates.filter((date): date is string => typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)))].sort().slice(-365)
    : null;
  if (!completed || !flawless || !moduleTests || !mistakes || !studyDates) return null;
  const flawlessCompleted = flawless.filter((id) => completed.includes(id));
  const passedModules = moduleTests.filter((module) =>
    Array.from({ length: 5 }, (_, index) => module * 5 - index).every((lesson) => completed.includes(lesson)),
  );
  return {
    completed, flawless: flawlessCompleted, moduleTests: passedModules, mistakes, studyDates,
    xp: completed.length * 20 + flawlessCompleted.length * 10 + passedModules.length * 40,
    bestStreak: Math.min(Math.max(Number(input.bestStreak) || 0, 0), 365),
  };
}

export async function getProgress(userId: string): Promise<ProgressPayload> {
  const rows = await dbQuery('SELECT payload FROM user_progress WHERE user_id = $1 LIMIT 1', [userId]);
  const progress = rows[0]?.payload ? normaliseProgress(rows[0].payload) : null;
  return progress ?? emptyProgress;
}

export async function saveProgress(userId: string, progress: ProgressPayload) {
  await dbQuery(`INSERT INTO user_progress (user_id, payload, updated_at)
    VALUES ($1, $2::jsonb, NOW())
    ON CONFLICT (user_id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`, [userId, JSON.stringify(progress)]);
}
