/**
 * IndexedDB wrapper using the `idb` library.
 * Provides all offline storage for Beyond.
 *
 * DB name: beyond-fitness  |  version: 1
 */
import { openDB } from 'idb';

const DB_NAME    = 'beyond-fitness';
const DB_VERSION = 1;

let _db = null;

export async function getDB() {
  if (_db) return _db;

  _db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // ── exercises ──────────────────────────────────────────
      if (!db.objectStoreNames.contains('exercises')) {
        const ex = db.createObjectStore('exercises', { keyPath: 'id' });
        ex.createIndex('muscleGroup', 'muscle_group');
      }

      // ── routines ───────────────────────────────────────────
      if (!db.objectStoreNames.contains('routines')) {
        const ro = db.createObjectStore('routines', { keyPath: 'id' });
        ro.createIndex('userId', 'user_id');
      }

      // ── routine_exercises ──────────────────────────────────
      if (!db.objectStoreNames.contains('routine_exercises')) {
        const re = db.createObjectStore('routine_exercises', { keyPath: 'id' });
        re.createIndex('routineId', 'routine_id');
      }

      // ── workout_sessions ───────────────────────────────────
      if (!db.objectStoreNames.contains('workout_sessions')) {
        const ws = db.createObjectStore('workout_sessions', { keyPath: 'id' });
        ws.createIndex('userId',    'user_id');
        ws.createIndex('startedAt', 'started_at');
      }

      // ── sets ───────────────────────────────────────────────
      if (!db.objectStoreNames.contains('sets')) {
        const se = db.createObjectStore('sets', { keyPath: 'id' });
        se.createIndex('sessionId',  'session_id');
        se.createIndex('exerciseId', 'exercise_id');
      }

      // ── sync_queue ─────────────────────────────────────────
      // Stores pending Supabase operations when offline
      if (!db.objectStoreNames.contains('sync_queue')) {
        db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
      }
    },
  });

  return _db;
}

// ── Generic CRUD helpers ──────────────────────────────────────────────────────

export async function dbGetAll(storeName) {
  const db = await getDB();
  return db.getAll(storeName);
}

export async function dbGet(storeName, key) {
  const db = await getDB();
  return db.get(storeName, key);
}

export async function dbPut(storeName, value) {
  const db = await getDB();
  return db.put(storeName, value);
}

export async function dbDelete(storeName, key) {
  const db = await getDB();
  return db.delete(storeName, key);
}

export async function dbGetByIndex(storeName, indexName, value) {
  const db = await getDB();
  return db.getAllFromIndex(storeName, indexName, value);
}

// ── Exercises ─────────────────────────────────────────────────────────────────

export async function cacheExercises(exercises) {
  const db = await getDB();
  const tx = db.transaction('exercises', 'readwrite');
  await Promise.all([
    ...exercises.map(e => tx.store.put(e)),
    tx.done,
  ]);
}

export async function getLocalExercises() {
  return dbGetAll('exercises');
}

// ── Workout sessions ──────────────────────────────────────────────────────────

export async function saveSessionLocal(session) {
  return dbPut('workout_sessions', session);
}

export async function getLocalSessions(userId) {
  return dbGetByIndex('workout_sessions', 'userId', userId);
}

export async function getLocalSession(id) {
  return dbGet('workout_sessions', id);
}

// ── Sets ──────────────────────────────────────────────────────────────────────

export async function saveSetsLocal(sets) {
  const db = await getDB();
  const tx = db.transaction('sets', 'readwrite');
  await Promise.all([
    ...sets.map(s => tx.store.put(s)),
    tx.done,
  ]);
}

export async function getSetsBySession(sessionId) {
  return dbGetByIndex('sets', 'sessionId', sessionId);
}

export async function getSetsByExercise(exerciseId) {
  return dbGetByIndex('sets', 'exerciseId', exerciseId);
}

/** Returns the best (max weight) set ever logged for an exercise */
export async function getPersonalRecord(exerciseId) {
  const allSets = await getSetsByExercise(exerciseId);
  if (!allSets.length) return null;
  return allSets.reduce((best, s) =>
    (s.weight ?? 0) > (best.weight ?? 0) ? s : best
  , allSets[0]);
}

/** Returns the last session's sets for a given exercise (for autofill) */
export async function getPreviousSets(exerciseId, currentSessionId) {
  const allSets = await getSetsByExercise(exerciseId);

  // Group by session, pick the most recent session that isn't current
  const bySession = {};
  for (const s of allSets) {
    if (s.session_id === currentSessionId) continue;
    if (!bySession[s.session_id]) bySession[s.session_id] = [];
    bySession[s.session_id].push(s);
  }

  const sessionIds = Object.keys(bySession);
  if (!sessionIds.length) return [];

  // Get session records to sort by date
  const sessions = await Promise.all(
    sessionIds.map(id => getLocalSession(id))
  );
  sessions.sort((a, b) =>
    new Date(b?.started_at ?? 0) - new Date(a?.started_at ?? 0)
  );

  const latestId = sessions[0]?.id;
  return latestId ? bySession[latestId] ?? [] : [];
}

// ── Routines ──────────────────────────────────────────────────────────────────

export async function saveRoutineLocal(routine) {
  return dbPut('routines', routine);
}

export async function saveRoutineExercisesLocal(routineExercises) {
  const db = await getDB();
  const tx = db.transaction('routine_exercises', 'readwrite');
  await Promise.all([
    ...routineExercises.map(re => tx.store.put(re)),
    tx.done,
  ]);
}

export async function getLocalRoutines(userId) {
  return dbGetByIndex('routines', 'userId', userId);
}

export async function getLocalRoutineExercises(routineId) {
  return dbGetByIndex('routine_exercises', 'routineId', routineId);
}

// ── Sync queue ────────────────────────────────────────────────────────────────

export async function enqueueSync(op) {
  const db = await getDB();
  return db.add('sync_queue', {
    ...op,
    timestamp: new Date().toISOString(),
  });
}

export async function getPendingSyncOps() {
  return dbGetAll('sync_queue');
}

export async function deleteSyncOp(id) {
  return dbDelete('sync_queue', id);
}

export async function clearSyncQueue() {
  const db = await getDB();
  return db.clear('sync_queue');
}
