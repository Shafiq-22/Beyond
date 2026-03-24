/**
 * Supabase sync layer.
 * Flushes the IndexedDB sync_queue to Supabase when online.
 * All writes that happen offline are enqueued here.
 */
import { supabase } from './supabase.js';
import {
  getPendingSyncOps,
  deleteSyncOp,
  enqueueSync,
} from './db.js';

/**
 * Process all pending sync operations in order.
 * Called when the app comes online.
 */
export async function processSyncQueue() {
  const ops = await getPendingSyncOps();
  if (!ops.length) return;

  for (const op of ops) {
    try {
      await executeOp(op);
      await deleteSyncOp(op.id);
    } catch (err) {
      console.error('[sync] Failed to sync op:', op, err);
      // Keep the op in queue; will retry next time
    }
  }
}

async function executeOp(op) {
  const { table, operation, data } = op;

  switch (operation) {
    case 'upsert': {
      const { error } = await supabase.from(table).upsert(data);
      if (error) throw error;
      break;
    }
    case 'delete': {
      const { error } = await supabase.from(table).delete().eq('id', data.id);
      if (error) throw error;
      break;
    }
    default:
      console.warn('[sync] Unknown operation:', operation);
  }
}

/**
 * Save a workout session + sets to Supabase.
 * Enqueues offline if not connected.
 */
export async function syncSession(session, sets, isOnline) {
  if (!isOnline) {
    await enqueueSync({ table: 'workout_sessions', operation: 'upsert', data: session });
    for (const set of sets) {
      await enqueueSync({ table: 'sets', operation: 'upsert', data: set });
    }
    return;
  }

  const { error: sessionErr } = await supabase
    .from('workout_sessions')
    .upsert(session);
  if (sessionErr) throw sessionErr;

  if (sets.length) {
    const { error: setsErr } = await supabase.from('sets').upsert(sets);
    if (setsErr) throw setsErr;
  }
}

/**
 * Upsert a routine + its exercises.
 */
export async function syncRoutine(routine, routineExercises, isOnline) {
  if (!isOnline) {
    await enqueueSync({ table: 'routines', operation: 'upsert', data: routine });
    for (const re of routineExercises) {
      await enqueueSync({ table: 'routine_exercises', operation: 'upsert', data: re });
    }
    return;
  }

  const { error } = await supabase.from('routines').upsert(routine);
  if (error) throw error;

  if (routineExercises.length) {
    const { error: reErr } = await supabase
      .from('routine_exercises')
      .upsert(routineExercises);
    if (reErr) throw reErr;
  }
}

/**
 * Delete a record from Supabase.
 */
export async function syncDelete(table, id, isOnline) {
  if (!isOnline) {
    await enqueueSync({ table, operation: 'delete', data: { id } });
    return;
  }
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
}
