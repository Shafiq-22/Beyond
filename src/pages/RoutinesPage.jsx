import React, { useState, useEffect, useCallback } from 'react';
import { TopBar }   from '../components/layout/TopBar.jsx';
import { Button }   from '../components/ui/Button.jsx';
import { Modal }    from '../components/ui/Modal.jsx';
import { Input }    from '../components/ui/Input.jsx';
import { Spinner }  from '../components/ui/Spinner.jsx';
import { AddExerciseModal } from '../components/workout/AddExerciseModal.jsx';
import { useRoutines }      from '../hooks/useRoutines.js';
import useExerciseStore     from '../stores/exerciseStore.js';
import { hapticMedium, hapticError } from '../lib/haptics.js';

export default function RoutinesPage() {
  const {
    routines, loaded,
    createRoutine, saveRoutine, deleteRoutine,
    getRoutineExercises,
  } = useRoutines();

  const exercises = useExerciseStore((s) => s.exercises);

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [newName,    setNewName]    = useState('');
  const [newNotes,   setNewNotes]   = useState('');
  const [creating,   setCreating]   = useState(false);

  // Edit modal
  const [editRoutine,   setEditRoutine]   = useState(null);
  const [editExercises, setEditExercises] = useState([]);
  const [showExPicker,  setShowExPicker]  = useState(false);
  const [saving,        setSaving]        = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await createRoutine(newName, newNotes);
      setNewName('');
      setNewNotes('');
      setShowCreate(false);
    } finally {
      setCreating(false);
    }
  };

  const openEdit = async (routine) => {
    setEditRoutine(routine);
    const exIds = await getRoutineExercises(routine.id);
    // Map to enriched objects for display
    const enriched = exIds
      .sort((a, b) => a.order_index - b.order_index)
      .map((re) => {
        const ex = exercises.find((e) => e.id === re.exercise_id) ?? {};
        return {
          id:              ex.id ?? re.exercise_id,
          name:            ex.name ?? re.exercise_id,
          muscle_group:    ex.muscle_group ?? '',
          routineExerciseId: re.id,
          target_sets:     re.target_sets,
          target_reps:     re.target_reps,
          target_weight:   re.target_weight,
        };
      });
    setEditExercises(enriched);
  };

  const handleSaveEdit = async () => {
    if (!editRoutine) return;
    setSaving(true);
    try {
      await saveRoutine(editRoutine, editExercises);
      setEditRoutine(null);
      setEditExercises([]);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    hapticError();
    if (!window.confirm('Delete this routine?')) return;
    await deleteRoutine(id);
  };

  const removeExFromEdit = (idx) => {
    setEditExercises((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <TopBar
        title="Routines"
        right={
          <button
            onClick={() => setShowCreate(true)}
            className="tap-target text-primary-400 hover:text-primary-300 rounded-lg"
            aria-label="Create routine"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        }
      />

      {!loaded ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : routines.length === 0 ? (
        <div className="text-center py-20 px-8">
          <p className="text-4xl mb-4">📋</p>
          <p className="font-medium text-surface-300">No routines yet</p>
          <p className="text-sm text-surface-500 mt-2">Create a routine to quickly start a workout.</p>
          <Button onClick={() => setShowCreate(true)} className="mt-5">Create Routine</Button>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-2">
          {routines.map((r) => (
            <div key={r.id} className="card px-4 py-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-white">{r.name}</p>
                {r.notes && (
                  <p className="text-xs text-surface-500 mt-0.5 line-clamp-1">{r.notes}</p>
                )}
              </div>
              <button
                onClick={() => openEdit(r)}
                className="tap-target w-9 h-9 rounded-xl bg-surface-800 hover:bg-surface-700 flex items-center justify-center text-surface-400 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                </svg>
              </button>
              <button
                onClick={() => handleDelete(r.id)}
                className="tap-target w-9 h-9 rounded-xl hover:bg-red-400/10 flex items-center justify-center text-surface-600 hover:text-red-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Routine">
        <form onSubmit={handleCreate} className="px-5 pb-6 flex flex-col gap-4">
          <Input
            label="Routine Name"
            placeholder="e.g. Push Day A"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
            autoFocus
          />
          <Input
            label="Notes (optional)"
            placeholder="Any details about this routine…"
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
          />
          <Button type="submit" loading={creating} className="w-full">Create</Button>
        </form>
      </Modal>

      {/* Edit modal */}
      <Modal
        isOpen={!!editRoutine}
        onClose={() => { setEditRoutine(null); setEditExercises([]); }}
        title={editRoutine?.name ?? 'Edit Routine'}
      >
        <div className="px-5 pb-6 flex flex-col gap-4">
          {editExercises.length === 0 ? (
            <p className="text-center text-sm text-surface-500 py-4">No exercises. Add some below.</p>
          ) : (
            <div className="space-y-2">
              {editExercises.map((ex, i) => (
                <div key={ex.id} className="flex items-center gap-3 bg-surface-800 rounded-xl px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{ex.name}</p>
                    <p className="text-xs text-surface-500 capitalize">{ex.muscle_group?.replace('_', ' ')}</p>
                  </div>
                  <button
                    onClick={() => removeExFromEdit(i)}
                    className="tap-target w-7 h-7 flex items-center justify-center text-surface-600 hover:text-red-400"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <Button variant="ghost" onClick={() => setShowExPicker(true)} className="w-full border border-dashed border-surface-700">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Exercise
          </Button>

          <Button onClick={handleSaveEdit} loading={saving} className="w-full">Save Routine</Button>
        </div>
      </Modal>

      {/* Exercise picker */}
      <AddExerciseModal
        isOpen={showExPicker}
        onClose={() => setShowExPicker(false)}
        onSelect={(ex) => {
          setEditExercises((prev) => [...prev, ex]);
          setShowExPicker(false);
        }}
        excludeIds={editExercises.map(e => e.id)}
      />
    </div>
  );
}
