import { useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';
import { cacheExercises, getLocalExercises, dbPut } from '../lib/db.js';
import useExerciseStore from '../stores/exerciseStore.js';
import useAuthStore from '../stores/authStore.js';
import { v4 as uuidv4 } from '../lib/uuid.js';
import { useOnlineStatus } from './useOnlineStatus.js';

export function useExercises() {
  const { exercises, loaded, setExercises, addExercise } = useExerciseStore();
  const { user } = useAuthStore();
  const isOnline = useOnlineStatus();

  // Load exercises on mount
  useEffect(() => {
    if (loaded) return;
    loadExercises();
  }, [loaded]);

  const loadExercises = useCallback(async () => {
    // Always load from IndexedDB first (instant)
    const local = await getLocalExercises();
    if (local.length) setExercises(local);

    // Then sync from Supabase if online
    if (isOnline) {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name');
      if (!error && data) {
        await cacheExercises(data);
        setExercises(data);
      }
    }
  }, [isOnline, setExercises]);

  const createCustomExercise = useCallback(async ({ name, muscle_group, equipment }) => {
    if (!user) throw new Error('Must be logged in');

    const exercise = {
      id:           uuidv4(),
      name:         name.trim(),
      muscle_group,
      equipment:    equipment || null,
      is_custom:    true,
      user_id:      user.id,
      created_at:   new Date().toISOString(),
    };

    // Save locally immediately
    await dbPut('exercises', exercise);
    addExercise(exercise);

    // Sync to Supabase
    if (isOnline) {
      const { error } = await supabase.from('exercises').insert(exercise);
      if (error) console.error('[useExercises] remote insert failed:', error);
    }

    return exercise;
  }, [user, isOnline, addExercise]);

  return { exercises, loaded, createCustomExercise, reload: loadExercises };
}
