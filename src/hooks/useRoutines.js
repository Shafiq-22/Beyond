import { useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';
import {
  saveRoutineLocal,
  saveRoutineExercisesLocal,
  getLocalRoutines,
  getLocalRoutineExercises,
  dbDelete,
} from '../lib/db.js';
import { syncRoutine, syncDelete } from '../lib/sync.js';
import useRoutineStore from '../stores/routineStore.js';
import useAuthStore    from '../stores/authStore.js';
import { v4 as uuidv4 } from '../lib/uuid.js';
import { useOnlineStatus } from './useOnlineStatus.js';

export function useRoutines() {
  const { routines, loaded, setRoutines, addRoutine, updateRoutine, removeRoutine } = useRoutineStore();
  const { user }   = useAuthStore();
  const isOnline   = useOnlineStatus();

  useEffect(() => {
    if (!user || loaded) return;
    loadRoutines();
  }, [user, loaded]);

  const loadRoutines = useCallback(async () => {
    if (!user) return;
    const local = await getLocalRoutines(user.id);
    if (local.length) setRoutines(local);

    if (isOnline) {
      const { data, error } = await supabase
        .from('routines')
        .select('*, routine_exercises(*, exercises(*))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        for (const r of data) {
          await saveRoutineLocal({ ...r, routine_exercises: undefined });
          if (r.routine_exercises?.length) {
            await saveRoutineExercisesLocal(r.routine_exercises);
          }
        }
        setRoutines(data);
      }
    }
  }, [user, isOnline, setRoutines]);

  const createRoutine = useCallback(async (name, notes = '') => {
    if (!user) throw new Error('Must be logged in');
    const routine = {
      id:         uuidv4(),
      user_id:    user.id,
      name:       name.trim(),
      notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await saveRoutineLocal(routine);
    addRoutine(routine);
    await syncRoutine(routine, [], isOnline);
    return routine;
  }, [user, isOnline, addRoutine]);

  const saveRoutine = useCallback(async (routine, exercises) => {
    const routineExercises = exercises.map((e, i) => ({
      id:            e.routineExerciseId ?? uuidv4(),
      routine_id:    routine.id,
      exercise_id:   e.id,
      order_index:   i,
      target_sets:   e.target_sets   ?? null,
      target_reps:   e.target_reps   ?? null,
      target_weight: e.target_weight ?? null,
    }));

    const updated = { ...routine, updated_at: new Date().toISOString() };
    await saveRoutineLocal(updated);
    await saveRoutineExercisesLocal(routineExercises);
    updateRoutine(routine.id, updated);
    await syncRoutine(updated, routineExercises, isOnline);
  }, [isOnline, updateRoutine]);

  const deleteRoutine = useCallback(async (id) => {
    await dbDelete('routines', id);
    removeRoutine(id);
    await syncDelete('routines', id, isOnline);
  }, [isOnline, removeRoutine]);

  const getRoutineExercises = useCallback(async (routineId) => {
    return getLocalRoutineExercises(routineId);
  }, []);

  return {
    routines,
    loaded,
    createRoutine,
    saveRoutine,
    deleteRoutine,
    getRoutineExercises,
    reload: loadRoutines,
  };
}
