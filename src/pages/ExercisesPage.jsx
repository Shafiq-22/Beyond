import React, { useState, useMemo } from 'react';
import { TopBar }   from '../components/layout/TopBar.jsx';
import { Input }    from '../components/ui/Input.jsx';
import { Button }   from '../components/ui/Button.jsx';
import { Modal }    from '../components/ui/Modal.jsx';
import { Spinner }  from '../components/ui/Spinner.jsx';
import { useExercises } from '../hooks/useExercises.js';
import useAuthStore     from '../stores/authStore.js';

const MUSCLE_GROUPS = [
  'all', 'chest', 'back', 'shoulders', 'biceps', 'triceps',
  'legs', 'glutes', 'core', 'cardio', 'full_body',
];

const EQUIPMENT = [
  'barbell', 'dumbbell', 'cable', 'machine', 'bodyweight',
  'kettlebell', 'resistance_band', 'smith_machine', 'other',
];

export default function ExercisesPage() {
  const { user }   = useAuthStore();
  const { exercises, loaded, createCustomExercise } = useExercises();

  const [query,  setQuery]  = useState('');
  const [filter, setFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);

  // New exercise form
  const [newName,   setNewName]   = useState('');
  const [newGroup,  setNewGroup]  = useState('chest');
  const [newEquip,  setNewEquip]  = useState('barbell');
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return exercises.filter((e) => {
      const matchName  = !q || e.name.toLowerCase().includes(q);
      const matchGroup = filter === 'all' || e.muscle_group === filter;
      return matchName && matchGroup;
    });
  }, [exercises, query, filter]);

  const grouped = useMemo(() => {
    const g = {};
    for (const e of filtered) {
      const key = e.muscle_group;
      if (!g[key]) g[key] = [];
      g[key].push(e);
    }
    return Object.entries(g).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const handleCreate = async (ev) => {
    ev.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    setSaveError('');
    try {
      await createCustomExercise({ name: newName, muscle_group: newGroup, equipment: newEquip });
      setNewName('');
      setShowAdd(false);
    } catch (err) {
      setSaveError(err.message ?? 'Failed to create exercise.');
    } finally {
      setSaving(false);
    }
  };

  const label = (s) => s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ');

  return (
    <div>
      <TopBar
        title="Exercises"
        right={
          user && (
            <button
              onClick={() => setShowAdd(true)}
              className="tap-target text-primary-400 hover:text-primary-300 rounded-lg"
              aria-label="Add exercise"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          )
        }
      />

      <div className="px-4 pt-4 pb-2 flex flex-col gap-3">
        {/* Search */}
        <Input
          placeholder="Search exercises…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {/* Muscle group chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {MUSCLE_GROUPS.map((g) => (
            <button
              key={g}
              onClick={() => setFilter(g)}
              className={`
                shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all
                ${filter === g
                  ? 'bg-primary-600 text-white'
                  : 'bg-surface-800 text-surface-400 hover:text-white border border-surface-700'
                }
              `}
            >
              {label(g)}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {!loaded ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-surface-500 text-sm">No exercises found.</div>
      ) : (
        <div className="px-4 pb-6 space-y-5">
          {grouped.map(([group, items]) => (
            <div key={group}>
              <p className="text-[11px] font-semibold text-surface-500 uppercase tracking-wider mb-2">
                {label(group)}
              </p>
              <div className="space-y-1">
                {items.map((ex) => (
                  <div
                    key={ex.id}
                    className="card px-4 py-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{ex.name}</p>
                      {ex.equipment && (
                        <p className="text-xs text-surface-500 capitalize mt-0.5">
                          {ex.equipment.replace('_', ' ')}
                        </p>
                      )}
                    </div>
                    {ex.is_custom && (
                      <span className="text-xs bg-primary-500/20 text-primary-400 border border-primary-500/30 rounded-full px-2 py-0.5 font-medium">
                        Custom
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add custom exercise modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Exercise">
        <form onSubmit={handleCreate} className="px-5 pb-6 flex flex-col gap-4">
          <Input
            label="Exercise Name"
            placeholder="e.g. Meadows Row"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
            autoFocus
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-surface-300">Muscle Group</label>
            <select
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value)}
              className="input-base"
            >
              {MUSCLE_GROUPS.filter(g => g !== 'all').map((g) => (
                <option key={g} value={g}>{label(g)}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-surface-300">Equipment</label>
            <select
              value={newEquip}
              onChange={(e) => setNewEquip(e.target.value)}
              className="input-base"
            >
              {EQUIPMENT.map((eq) => (
                <option key={eq} value={eq}>{label(eq)}</option>
              ))}
            </select>
          </div>

          {saveError && (
            <p className="text-sm text-red-400">{saveError}</p>
          )}

          <Button type="submit" loading={saving} className="w-full">
            Create Exercise
          </Button>
        </form>
      </Modal>
    </div>
  );
}
